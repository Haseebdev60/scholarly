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
    const user = await User.findById(req.user!.id).populate('enrolledSubjects')
    res.json(user?.enrolledSubjects || [])
})

// GET /api/student/available-classes
router.get('/available-classes', requireAuth, async (req: AuthedRequest, res) => {
    // Find classes scheduled in the future
    const classes = await Class.find({ scheduledDate: { $gte: new Date() } })
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
