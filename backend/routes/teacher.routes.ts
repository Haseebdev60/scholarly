import { Router } from 'express'
import User from '../models/User.js'
import Class from '../models/Class.js'
import Subject from '../models/Subject.js'
import Quiz from '../models/Quiz.js'
import Resource from '../models/Resource.js'
import Message from '../models/Message.js'
import Booking from '../models/Booking.js'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth.js'

const router = Router()

// Guard all routes
router.use(requireAuth)
router.use(requireRole('teacher'))

// POST /api/teacher/create-class
router.post('/create-class', async (req: AuthedRequest, res) => {
    const { title, subjectId, scheduledDate, duration, classType } = req.body
    const newClass = await Class.create({
        title,
        subjectId,
        teacherId: req.user!.id,
        scheduledDate,
        duration,
        classType,
        isSubscriptionRequired: true
    })
    res.json(newClass)
})

// POST /api/teacher/create-quiz
router.post('/create-quiz', async (req: AuthedRequest, res) => {
    const { title, subjectId, questions } = req.body
    const quiz = await Quiz.create({
        title,
        subjectId,
        teacherId: req.user!.id,
        questions,
        isPremium: true
    })
    res.json(quiz)
})

// POST /api/teacher/create-resource
router.post('/create-resource', async (req: AuthedRequest, res) => {
    try {
        const { title, type, url, subjectId, isPremium, fileType, size, fileData, fileName, format, year, thumbnail } = req.body
        if (!title || !subjectId) return res.status(400).json({ error: 'Missing fields' })

        let finalUrl = url
        if (fileData && fileName) {
            try {
                const fs = await import('fs')
                const path = await import('path')
                const uploadsDir = process.env.NODE_ENV === 'production'
                    ? path.join('/tmp', 'uploads')
                    : path.join(process.cwd(), 'public/uploads')

                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true })
                }
                const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, '_')}`
                const filePath = path.join(uploadsDir, uniqueName)
                const base64Data = fileData.replace(/^data:.*,/, '')
                await fs.promises.writeFile(filePath, base64Data, 'base64')
                finalUrl = `/uploads/${uniqueName}`
            } catch (err: any) {
                console.error("Upload error:", err)
                return res.status(500).json({ error: 'Failed to write file' })
            }
        }

        const resource = await Resource.create({
            title,
            type: type || 'link',
            url: finalUrl,
            subjectId,
            teacherId: req.user!.id,
            uploadedBy: 'teacher',
            isPremium: isPremium || false,
            fileType,
            size,
            format,
            year,
            thumbnail
        })
        res.json(resource)
    } catch (err: any) {
        console.error('Create Resource Error:', err)
        res.status(500).json({ error: err.message || 'Internal server error' })
    }
})

// GET /api/teacher/dashboard
router.get('/dashboard', async (req: AuthedRequest, res) => {
    const classes = await Class.find({ teacherId: req.user!.id }).populate('subjectId', 'title')
    const resources = await Resource.find({ teacherId: req.user!.id }).populate('subjectId', 'title')
    res.json({ classes, resources })
})

// GET /api/teacher/view-assigned-subjects
router.get('/view-assigned-subjects', async (req: AuthedRequest, res) => {
    const user = await User.findById(req.user!.id).populate('assignedSubjects')
    res.json(user?.assignedSubjects || [])
})

// GET /api/teacher/bookings
router.get('/bookings', async (req: AuthedRequest, res) => {
    const bookings = await Booking.find({ teacherId: req.user!.id }).populate('studentId', 'name email')
    res.json(bookings)
})

// UPDATE class
router.put('/update-class/:id', async (req: AuthedRequest, res) => {
    const updated = await Class.findOneAndUpdate(
        { _id: req.params.id, teacherId: req.user!.id },
        req.body,
        { new: true }
    )
    res.json(updated)
})

// DELETE resource
router.delete('/resource/:id', async (req: AuthedRequest, res) => {
    await Resource.findOneAndDelete({ _id: req.params.id, teacherId: req.user!.id })
    res.json({ success: true })
})

// Availability (Settings)
router.post('/availability', async (req: AuthedRequest, res) => {
    const { availability } = req.body // string[]
    await User.findByIdAndUpdate(req.user!.id, { availability })
    res.json({ success: true })
})

router.get('/availability', async (req: AuthedRequest, res) => {
    const user = await User.findById(req.user!.id)
    res.json(user?.availability || [])
})

export default router
