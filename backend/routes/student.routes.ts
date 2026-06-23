import { Router } from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Class from '../models/Class.js'
import Subject from '../models/Subject.js'
import Quiz from '../models/Quiz.js'
import Booking from '../models/Booking.js'
import Message from '../models/Message.js'
import { requireAuth, requireActiveSubscription, type AuthedRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/student/enrolled-subjects
router.get('/enrolled-subjects', requireAuth, async (req: AuthedRequest, res) => {
    // 1. Assign fallback teacher to any subject that has teacherId: null
    const fallbackTeacher = await User.findOne({ role: 'teacher', approved: true });
    if (fallbackTeacher) {
        const noTeacherSubjects = await Subject.find({ teacherId: null });
        for (const subj of noTeacherSubjects) {
            subj.teacherId = fallbackTeacher._id;
            await subj.save();
            await User.findByIdAndUpdate(fallbackTeacher._id, {
                $addToSet: { assignedSubjects: subj._id }
            });
        }
    }

    const student = await User.findById(req.user!.id).populate({
        path: 'enrolledSubjects',
        populate: {
            path: 'teacherId',
            select: 'name avatar bio'
        }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Proactive Sync: If student has active subscription, check if they are enrolled in all subjects
    const exp = student.subscriptionExpiryDate ? new Date(student.subscriptionExpiryDate) : null;
    const hasActiveSub = student.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now();
    if (hasActiveSub) {
        const allSubjects = await Subject.find().select('_id');
        const enrolledIds = student.enrolledSubjects.map((s: any) => s._id.toString());
        const missingIds = allSubjects.filter(s => !enrolledIds.includes(s._id.toString())).map(s => s._id);

        if (missingIds.length > 0) {
            await User.findByIdAndUpdate(req.user!.id, {
                $addToSet: { enrolledSubjects: { $each: missingIds } }
            });
            const updatedStudent = await User.findById(req.user!.id).populate({
                path: 'enrolledSubjects',
                populate: {
                    path: 'teacherId',
                    select: 'name avatar bio'
                }
            });
            return res.json(updatedStudent?.enrolledSubjects || []);
        }
    }

    res.json(student.enrolledSubjects || [])
})

// GET /api/student/available-classes
router.get('/available-classes', requireAuth, async (req: AuthedRequest, res) => {
    const student = await User.findById(req.user!.id).select('enrolledSubjects');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Proactive Sync: Make sure student is enrolled in all subjects
    const allSubjects = await Subject.find().select('_id');
    const allSubjectIds = allSubjects.map((s: any) => s._id.toString());
    const enrolledIds = (student.enrolledSubjects || []).map((s: any) => s.toString());
    const missingIds = allSubjects.filter((s: any) => !enrolledIds.includes(s._id.toString())).map((s: any) => s._id);

    if (missingIds.length > 0) {
        await User.findByIdAndUpdate(req.user!.id, {
            $addToSet: { enrolledSubjects: { $each: missingIds } }
        });
        student.enrolledSubjects = [...(student.enrolledSubjects || []), ...missingIds];
    }

    const classes = await Class.find({
        subjectId: { $in: student.enrolledSubjects }
    })
        .populate('subjectId', 'title')
        .populate('teacherId', 'name')
        .sort({ scheduledDate: 1 })
    res.json(classes)
})

// POST /api/student/enroll-subject
router.post('/enroll-subject', requireAuth, async (req: AuthedRequest, res) => {
    const { subjectId } = req.body
    await User.findByIdAndUpdate(req.user!.id, { $addToSet: { enrolledSubjects: subjectId } })
    res.json({ success: true, message: 'Enrolled successfully' })
})

// POST /api/student/attempt-quiz
router.post('/attempt-quiz', requireAuth, async (req: AuthedRequest, res) => {
    const { quizId, answers } = req.body // answers: index[]
    const quiz = await Quiz.findById(quizId)
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' })

    // Calculate score
    let correct = 0
    quiz.questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correctIndex) correct++
    })

    res.json({
        score: Math.round((correct / quiz.questions.length) * 100),
        totalQuestions: quiz.questions.length,
        correctAnswers: correct
    })
})

// GET /api/student/bookings
router.get('/bookings', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const bookings = await Booking.find({ studentId: req.user!.id })
            .populate('teacherId', 'name email')
            .sort({ date: 1 })
        res.json(bookings)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// GET /api/student/teachers/:teacherId/availability
router.get('/teachers/:teacherId/availability', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const { teacherId } = req.params
        const teacher = await User.findById(teacherId).select('availability')
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' })

        // Get bookings for next 30 days
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 30)
        const bookings = await Booking.find({
            teacherId,
            date: { $gte: startDate, $lte: endDate },
            status: { $ne: 'cancelled' }
        })
        res.json({
            availability: teacher.availability || [],
            bookings
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/student/book-class
router.post('/book-class', requireAuth, requireActiveSubscription, async (req: AuthedRequest, res) => {
    try {
        const { teacherId, date, duration, subjectId, notes } = req.body
        const bookingDate = new Date(date)
        const teacher = await User.findById(teacherId)
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' })

        const existing = await Booking.findOne({
            teacherId,
            date: bookingDate,
            status: { $in: ['pending_payment', 'confirmed'] }
        })
        if (existing) {
            return res.status(400).json({ error: 'Slot already booked' })
        }

        const price = Math.round((duration / 60) * (teacher.hourlyRate || 2000))
        const booking = await Booking.create({
            studentId: req.user!.id,
            teacherId,
            date: bookingDate,
            duration,
            subjectId,
            notes,
            status: 'pending_payment',
            price
        })
        res.status(201).json(booking)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/student/pay-booking
router.post('/pay-booking', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const { bookingId } = req.body
        const booking = await Booking.findOne({ _id: bookingId, studentId: req.user!.id })
        if (!booking) return res.status(404).json({ error: 'Booking not found' })

        if (booking.status !== 'pending_payment') {
            return res.status(400).json({ error: `Booking is ${booking.status}` })
        }

        const now = new Date()
        const diff = (now.getTime() - new Date(booking.createdAt).getTime()) / 60000
        if (diff > 15) {
            booking.status = 'expired'
            await booking.save()
            return res.status(400).json({ error: 'Booking expired' })
        }

        booking.status = 'confirmed'
        await booking.save()
        res.json({ success: true, booking })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/student/cancel-booking
router.post('/cancel-booking', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const { bookingId } = req.body
        await Booking.findOneAndUpdate({ _id: bookingId, studentId: req.user!.id }, { status: 'cancelled' })
        res.json({ success: true })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/student/message (send)
router.post('/message', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const { recipientId, recipientName, subject, message } = req.body
        await Message.create({
            senderId: req.user!.id,
            recipientId,
            recipientName,
            subject,
            content: message,
            read: false
        })
        res.json({ success: true, message: 'Message sent' })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// GET /api/student/conversations
router.get('/conversations', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const studentId = req.user!.id
        const studentIdObj = new mongoose.Types.ObjectId(studentId)
        const conversations = await Message.aggregate([
            { $match: { $or: [{ senderId: studentIdObj }, { recipientId: studentIdObj }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ["$senderId", studentIdObj] }, "$recipientId", "$senderId"]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    lastMessage: 1
                }
            }
        ])
        res.json(conversations)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// GET /api/student/messages/:userId
router.get('/messages/:userId', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const studentId = req.user!.id
        const { userId } = req.params
        const messages = await Message.find({
            $or: [
                { senderId: studentId, recipientId: userId },
                { senderId: userId, recipientId: studentId }
            ]
        }).sort({ createdAt: 1 })
        res.json(messages)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

// POST /api/student/generate-quiz
router.post('/generate-quiz', requireAuth, async (req: AuthedRequest, res) => {
    try {
        const { prompt } = req.body ?? {}
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

        const topic = prompt.toLowerCase()
        let questions = []
        let title = 'General Knowledge Quiz'
        if (topic.includes('math') || topic.includes('calculus') || topic.includes('integral')) {
            title = 'Math Practice: Calculus & Algebra'
            questions = [
                { question: 'What is the integral of x^2?', options: ['x^3/3 + C', '2x + C', 'x^2 + C', '3x^3'], correctIndex: 0 },
                { question: 'Derivative of sin(x)?', options: ['-cos(x)', 'cos(x)', 'tan(x)', 'sec(x)'], correctIndex: 1 },
                { question: 'Value of pi to 2 decimals?', options: ['3.12', '3.14', '3.16', '3.18'], correctIndex: 1 },
                { question: 'Solve for x: 2x + 5 = 15', options: ['2', '5', '10', '7.5'], correctIndex: 1 },
                { question: 'sqrt(144) = ?', options: ['10', '11', '12', '13'], correctIndex: 2 }
            ]
        } else if (topic.includes('physics') || topic.includes('science')) {
            title = 'Physics & Science Explorer'
            questions = [
                { question: 'Unit of Force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctIndex: 1 },
                { question: 'Speed of light?', options: ['3x10^8 m/s', '300 m/s', 'Sound speed', 'Infinite'], correctIndex: 0 },
                { question: 'F = ma is which law?', options: ['1st', '2nd', '3rd', '4th'], correctIndex: 1 },
                { question: 'Earth gravity acceleration?', options: ['9.8 m/s^2', '10.5 m/s^2', '8 m/s^2', 'Zero'], correctIndex: 0 },
                { question: 'Power formula?', options: ['Work/Time', 'Force*Distance', 'Mass*Accel', 'None'], correctIndex: 0 }
            ]
        } else if (topic.includes('history') || topic.includes('war')) {
            title = 'History Buff Challenge'
            questions = [
                { question: 'Start of WWII?', options: ['1914', '1939', '1945', '1929'], correctIndex: 1 },
                { question: 'First US President?', options: ['Lincoln', 'Washington', 'Jefferson', 'Adams'], correctIndex: 1 },
                { question: 'Who built the Pyramids?', options: ['Romans', 'Egyptians', 'Mayans', 'Greeks'], correctIndex: 1 },
                { question: 'Magna Carta year?', options: ['1215', '1492', '1776', '1066'], correctIndex: 0 },
                { question: 'Moon landing year?', options: ['1969', '1959', '1975', '1980'], correctIndex: 0 }
            ]
        } else {
            title = 'AI Generated Quiz: ' + prompt.slice(0, 20) + '...'
            questions = [
                { question: 'Which is an AI model?', options: ['GPT-4', 'Excel', 'Paint', 'Notepad'], correctIndex: 0 },
                { question: 'What does CPU stand for?', options: ['Central Process Unit', 'Computer Power Unit', 'Core Process Unit', 'None'], correctIndex: 0 },
                { question: 'Capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctIndex: 2 },
                { question: 'H2O is?', options: ['Salt', 'Water', 'Gold', 'Silver'], correctIndex: 1 },
                { question: 'Largest planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correctIndex: 2 }
            ]
        }

        const firstSubject = await Subject.findOne()
        const quiz = await Quiz.create({
            title,
            subjectId: firstSubject?._id || null,
            questions,
            isPremium: false,
            teacherId: req.user!.id
        })
        res.json(quiz)
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

export default router
