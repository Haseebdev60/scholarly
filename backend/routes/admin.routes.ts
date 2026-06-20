import { Router } from 'express'
import User from '../models/User.js'
import Resource from '../models/Resource.js'
import Subject from '../models/Subject.js'
import Class from '../models/Class.js'
import Message from '../models/Message.js'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js'
import bcrypt from 'bcryptjs'

const router = Router()
router.use(requireAuth)
router.use(requireRole('admin'))

// GET users
router.get('/users', async (req, res) => {
    const users = await User.find().select('-password')
    res.json(users)
})

// POST create-teacher
router.post('/create-teacher', async (req, res) => {
    const { name, email, password } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ error: 'Email already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        name, email, password: hashedPassword, role: 'teacher', approved: true
    })
    res.json({ user: { _id: user._id, name: user.name } })
})

// POST approve-teacher
router.post('/approve-teacher', async (req, res) => {
    const { teacherId, approve } = req.body
    await User.findByIdAndUpdate(teacherId, { approved: approve })
    res.json({ approved: approve })
})

// POST assign-subject
router.post('/assign-subject', async (req, res) => {
    const { teacherId, subjectId } = req.body
    await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedSubjects: subjectId } })
    res.json({ assigned: true })
})

// POST upload-resource (Admin)
router.post('/upload-resource', async (req: AuthedRequest, res) => {
    const { title, type, url, subjectId, isPremium } = req.body
    const resource = await Resource.create({
        title, type, url, subjectId,
        uploadedBy: 'admin',
        isPremium
    })
    res.json(resource)
})

// DELETE resource
router.post('/delete-resource', async (req, res) => {
    const { resourceId } = req.body
    await Resource.findByIdAndDelete(resourceId)
    res.json({ success: true })
})

// DELETE user
router.post('/delete-user', async (req, res) => {
    const { userId } = req.body
    await User.findByIdAndDelete(userId)
    res.json({ success: true })
})

// Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
    const totalUsers = await User.countDocuments()
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalTeachers = await User.countDocuments({ role: 'teacher' })
    const totalSubjects = await Subject.countDocuments()
    const totalClasses = await Class.countDocuments()
    const totalResources = await Resource.countDocuments()
    res.json({ totalUsers, totalStudents, totalTeachers, totalSubjects, totalClasses, totalResources })
})

// PUT /api/admin/update-user/:userId
router.put('/update-user/:userId', async (req, res) => {
    const { userId } = req.params
    const { name, email, password } = req.body ?? {}
    if (!name || !email)
        return res.status(400).json({ error: 'Missing name or email' })

    const user = await User.findById(userId)
    if (!user)
        return res.status(404).json({ error: 'User not found' })

    user.name = name
    user.email = email
    if (password && password.trim().length > 0) {
        user.password = password // Will be hashed by pre-save hook
    }
    await user.save()
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
})

// GET /api/admin/teacher-stats/:teacherId
router.get('/teacher-stats/:teacherId', async (req, res) => {
    const { teacherId } = req.params
    const teacher = await User.findById(teacherId)
    if (!teacher || teacher.role !== 'teacher')
        return res.status(404).json({ error: 'Teacher not found' })

    const allStudents = await User.find({
        role: 'student',
        enrolledSubjects: { $in: teacher.assignedSubjects }
    }).select('enrolledSubjects')
    const studentCount = allStudents.length

    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    const [totalClasses, classesYear, classesMonth, classesWeek] = await Promise.all([
        Class.countDocuments({ teacherId }),
        Class.countDocuments({ teacherId, scheduledDate: { $gte: startOfYear } }),
        Class.countDocuments({ teacherId, scheduledDate: { $gte: startOfMonth } }),
        Class.countDocuments({ teacherId, scheduledDate: { $gte: startOfWeek } }),
    ])

    const subjectsData = await Subject.find({ _id: { $in: teacher.assignedSubjects } }).lean()
    const subjects = subjectsData.map((sub: any) => {
        const count = allStudents.filter(s => s.enrolledSubjects && (s.enrolledSubjects as any[]).some((es: any) => es.toString() === sub._id.toString())).length
        return {
            _id: sub._id,
            title: sub.title,
            studentCount: count
        }
    })

    res.json({
        studentCount,
        classCounts: {
            total: totalClasses,
            thisYear: classesYear,
            thisMonth: classesMonth,
            thisWeek: classesWeek
        },
        assignedSubjects: subjects
    })
})

// GET /api/admin/conversations
router.get('/conversations', async (req: AuthedRequest, res) => {
    const adminId = req.user!.id
    const mongoose = await import('mongoose')
    const adminIdObj = new mongoose.Types.ObjectId(adminId)
    console.log('Fetching conversations for admin:', adminId)
    const conversations = await Message.aggregate([
        { $match: { $or: [{ senderId: adminIdObj }, { recipientId: adminIdObj }] } },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: {
                    $cond: [{ $eq: ["$senderId", adminIdObj] }, "$recipientId", "$senderId"]
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

// GET /api/admin/messages/:userId
router.get('/messages/:userId', async (req: AuthedRequest, res) => {
    const adminId = req.user!.id
    const { userId } = req.params
    const messages = await Message.find({
        $or: [
            { senderId: adminId, recipientId: userId },
            { senderId: userId, recipientId: adminId }
        ]
    }).sort({ createdAt: 1 })
    res.json(messages)
})

// POST /api/admin/message
router.post('/message', async (req: AuthedRequest, res) => {
    const { recipientId, content } = req.body
    const recipient = await User.findById(recipientId)
    const msg = await Message.create({
        senderId: req.user!.id,
        recipientId,
        recipientName: recipient?.name || 'Unknown',
        subject: 'Admin Message',
        content,
        read: false
    })
    res.json(msg)
})

export default router
