import { Router } from 'express'
import User from '../models/User.js'
import Resource from '../models/Resource.js'
import Subject from '../models/Subject.js'
import Class from '../models/Class.js'
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

export default router
