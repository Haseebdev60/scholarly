import { Router } from 'express'
import User from '../models/User.js'
import Class from '../models/Class.js'
import Subject from '../models/Subject.js'
import Quiz from '../models/Quiz.js'
import Booking from '../models/Booking.js'
import Message from '../models/Message.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

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

// POST /api/student/book-class
router.post('/book-class', requireAuth, async (req: AuthedRequest, res) => {
    const { teacherId, date, duration, subjectId, notes } = req.body
    const booking = await Booking.create({
        studentId: req.user!.id,
        teacherId,
        subjectId,
        date,
        duration,
        price: 0, // Placeholder
        notes,
        status: 'pending_payment'
    })
    res.json({ _id: booking._id })
})

// POST /api/student/pay-booking
router.post('/pay-booking', requireAuth, async (req: AuthedRequest, res) => {
    const { bookingId } = req.body
    await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed' })
    res.json({ success: true })
})

// POST /api/student/message (send)
router.post('/message', requireAuth, async (req: AuthedRequest, res) => {
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
})

// GET /api/student/conversations
router.get('/conversations', requireAuth, async (req: AuthedRequest, res) => {
    const messages = await Message.find({ $or: [{ senderId: req.user!.id }, { recipientId: req.user!.id }] })
        .sort({ createdAt: -1 })
    res.json([]) // TODO: Implement proper grouping
})

export default router
