import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

const router = Router()

router.post('/buy-subscription', requireAuth, async (req: AuthedRequest, res) => {
    const { plan } = req.body // 'weekly' | 'monthly'
    const duration = plan === 'weekly' ? 7 : 30
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + duration)

    // Fetch all available subjects to auto-enroll
    const Subject = (await import('../models/Subject.js')).default
    const subjects = await Subject.find().select('_id')
    const subjectIds = subjects.map(s => s._id)

    const student = await User.findByIdAndUpdate(req.user!.id, {
        subscriptionStatus: plan,
        subscriptionExpiryDate: expiry,
        enrolledSubjects: subjectIds
    }, { new: true })

    res.json({
        subscriptionStatus: student?.subscriptionStatus,
        subscriptionExpiryDate: student?.subscriptionExpiryDate
    })
})

router.get('/check-status', requireAuth, async (req: AuthedRequest, res) => {
    const user = await User.findById(req.user!.id)
    const exp = user?.subscriptionExpiryDate ? new Date(user.subscriptionExpiryDate) : null
    const isActive = user?.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now()

    res.json({
        subscriptionStatus: user?.subscriptionStatus,
        subscriptionExpiryDate: user?.subscriptionExpiryDate,
        isActive
    })
})

export default router
