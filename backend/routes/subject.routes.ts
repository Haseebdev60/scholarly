import { Router } from 'express'
import Subject from '../models/Subject.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// Public: List all
router.get('/', async (req, res) => {
    const subjects = await Subject.find()
    res.json(subjects)
})

// Admin Only: Create/Update/Delete
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
    const { title } = req.body
    const subject = await Subject.create({ title })
    res.json(subject)
})

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
    await Subject.findByIdAndDelete(req.params.id)
    res.json({ success: true })
})

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
    const { title } = req.body
    const subject = await Subject.findByIdAndUpdate(req.params.id, { title }, { new: true })
    res.json(subject)
})

export default router
