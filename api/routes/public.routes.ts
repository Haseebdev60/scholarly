import { Router } from 'express'
import User from '../models/User.js'
import Resource from '../models/Resource.js'

const router = Router()

router.get('/teachers', async (req, res) => {
    const teachers = await User.find({ role: 'teacher', approved: true })
        .select('-password')
        .populate('assignedSubjects')
    res.json(teachers)
})

router.get('/resources', async (req, res) => {
    const { type } = req.query
    const query = type ? { type } : {}
    const resources = await Resource.find(query).populate('subjectId', 'title')
    res.json(resources)
})

router.get('/admin-contact', async (req, res) => {
    // Return first admin or generic contact
    const admin = await User.findOne({ role: 'admin' }).select('name email')
    res.json(admin || { name: 'Admin', email: 'admin@example.com' })
})

export default router
