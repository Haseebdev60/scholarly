import { Router } from 'express'
import { requireAuth, requireRole, requireActiveSubscription, type AuthedRequest } from '../middleware/auth'
import User from '../models/User'
import Subject from '../models/Subject'
import ClassModel from '../models/Class'
import Quiz from '../models/Quiz'

const router = Router()

router.use(requireAuth, requireRole('student'))

// GET /api/student/enrolled-subjects
router.get('/enrolled-subjects', async (req: AuthedRequest, res) => {
  const student = await User.findById(req.user!.id).populate('enrolledSubjects')
  if (!student) return res.status(404).json({ error: 'Student not found' })
  res.json(student.enrolledSubjects ?? [])
})

// POST /api/student/enroll-subject
// body: { subjectId }
// Only students with active subscription can enroll
router.post('/enroll-subject', requireActiveSubscription, async (req: AuthedRequest, res) => {
  const { subjectId } = req.body ?? {}
  if (!subjectId) return res.status(400).json({ error: 'subjectId required' })

  const subject = await Subject.findById(subjectId)
  if (!subject) return res.status(404).json({ error: 'Subject not found' })

  const student = await User.findById(req.user!.id)
  if (!student) return res.status(404).json({ error: 'Student not found' })

  if (student.enrolledSubjects.includes(subjectId as any)) {
    return res.status(400).json({ error: 'Already enrolled in this subject' })
  }

  student.enrolledSubjects.push(subjectId as any)
  await student.save()

  res.json({ success: true, message: 'Enrolled successfully' })
})

// GET /api/student/available-classes
// Only active subscription can view/join classes (as per requirements)
router.get('/available-classes', requireActiveSubscription, async (req: AuthedRequest, res) => {
  const student = await User.findById(req.user!.id).select('enrolledSubjects')
  if (!student) return res.status(404).json({ error: 'Student not found' })

  const classes = await ClassModel.find({
    isSubscriptionRequired: true,
    subjectId: { $in: student.enrolledSubjects }
  })
    .populate('subjectId', 'title')
    .populate('teacherId', 'name')
    .sort({ scheduledDate: 1 })
  res.json(classes)
})



// GET /api/student/subjects
// Free users can view subjects; premium subjects should be flagged
router.get('/subjects', async (_req, res) => {
  const subjects = await Subject.find().select('title description teacherId isPremium')
  res.json(subjects)
})

// POST /api/student/message - Send a message to a teacher
router.post('/message', requireAuth, requireRole('student'), async (req: AuthedRequest, res) => {
  try {
    const { recipientId, recipientName, subject, message } = req.body

    if (!recipientId) return res.status(400).json({ error: 'Recipient ID required' })

    await import('../models/Message').then(m => m.default.create({
      senderId: req.user?.id,
      recipientId,
      recipientName,
      subject,
      content: message
    }))

    res.json({ success: true, message: 'Message sent' })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// GET /api/student/conversations
router.get('/conversations', requireAuth, requireRole('student'), async (req: AuthedRequest, res) => {
  const studentId = req.user!.id
  const mongoose = await import('mongoose')
  const studentIdObj = new mongoose.Types.ObjectId(studentId)
  const Message = (await import('../models/Message')).default

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
})

// GET /api/student/messages/:userId
router.get('/messages/:userId', requireAuth, requireRole('student'), async (req: AuthedRequest, res) => {
  const studentId = req.user!.id
  const { userId } = req.params
  const Message = (await import('../models/Message')).default

  const messages = await Message.find({
    $or: [
      { senderId: studentId, recipientId: userId },
      { senderId: userId, recipientId: studentId }
    ]
  }).sort({ createdAt: 1 })

  res.json(messages)
})

// GET /api/student/bookings
router.get('/bookings', async (req: AuthedRequest, res) => {
  const bookings = await import('../models/Booking').then(m =>
    m.default.find({ studentId: req.user!.id })
      .populate('teacherId', 'name email')
      .sort({ date: 1 })
  )
  res.json(bookings)
})

// GET /api/student/teachers/:id/availability
router.get('/teachers/:teacherId/availability', async (req: AuthedRequest, res) => {
  const { teacherId } = req.params
  const teacher = await User.findById(teacherId).select('availability')
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' })

  // Get bookings for next 30 days
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)

  const bookings = await import('../models/Booking').then(m =>
    m.default.find({
      teacherId,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    })
  )

  res.json({
    availability: teacher.availability || [],
    bookings
  })
})

// POST /api/student/book-class
router.post('/book-class', requireActiveSubscription, async (req: AuthedRequest, res) => {
  const { teacherId, date, duration, subjectId, notes } = req.body

  const bookingDate = new Date(date)
  const Booking = (await import('../models/Booking')).default
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
})

// POST /api/student/pay-booking
router.post('/pay-booking', async (req: AuthedRequest, res) => {
  const { bookingId } = req.body
  const Booking = (await import('../models/Booking')).default

  const booking = await Booking.findOne({ _id: bookingId, studentId: req.user!.id })
  if (!booking) return res.status(404).json({ error: 'Booking not found' })

  if (booking.status !== 'pending_payment') {
    return res.status(400).json({ error: `Booking is ${booking.status}` })
  }

  // Checking expiry
  const now = new Date()
  const diff = (now.getTime() - new Date(booking.createdAt).getTime()) / 60000
  if (diff > 15) {
    booking.status = 'expired'
    await booking.save()
    return res.status(400).json({ error: 'Booking expired' })
  }

  // Simulate payment
  booking.status = 'confirmed'
  await booking.save()

  res.json({ success: true, booking })
})


// POST /api/student/cancel-booking
router.post('/cancel-booking', async (req: AuthedRequest, res) => {
  const { bookingId } = req.body
  await import('../models/Booking').then(m =>
    m.default.findOneAndUpdate({ _id: bookingId, studentId: req.user!.id }, { status: 'cancelled' })
  )
  res.json({ success: true })
})

// POST /api/student/generate-quiz
router.post('/generate-quiz', requireAuth, async (req: AuthedRequest, res) => {
  const { prompt } = req.body ?? {}
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

  // Simulate AI generation
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

  // Create ephemeral quiz or save it?
  // User asked to "generate" it. Let's create it in DB so they can take it normally.
  const quiz = await Quiz.create({
    title,
    subjectId: (await Subject.findOne())?._id, // Assign to first subject as fallback/generic
    questions,
    isPremium: false,
    teacherId: req.user!.id // Self-generated
  })

  res.json(quiz)
})

export default router

