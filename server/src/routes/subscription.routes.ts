import { Router } from 'express'
import User from '../models/User'
import { requireAuth, requireRole, type AuthedRequest } from '../middleware/auth'

const router = Router()

// POST /api/subscriptions/buy-subscription
// Dummy payment confirmation, no gateway.
// body: { plan: weekly|monthly }
router.post('/buy-subscription', requireAuth, requireRole('student'), async (req: AuthedRequest, res) => {
  const { plan } = req.body ?? {}
  if (!['weekly', 'monthly'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' })

  const days = plan === 'weekly' ? 7 : 30
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  const updated = await User.findByIdAndUpdate(
    req.user!.id,
    { subscriptionStatus: plan, subscriptionExpiryDate: expiry },
    { new: true },
  ).select('subscriptionStatus subscriptionExpiryDate')

  res.json({
    message: 'Subscription activated (dummy payment)',
    subscriptionStatus: updated?.subscriptionStatus,
    subscriptionExpiryDate: updated?.subscriptionExpiryDate,
    pricePKR: plan === 'weekly' ? 300 : 1000,
  })
})

// GET /api/subscriptions/check-status
router.get('/check-status', requireAuth, requireRole('student'), async (req: AuthedRequest, res) => {
  const student = await User.findById(req.user!.id).select('subscriptionStatus subscriptionExpiryDate')
  if (!student) return res.status(404).json({ error: 'Student not found' })

  const exp = student.subscriptionExpiryDate ? new Date(student.subscriptionExpiryDate) : null
  const active = student.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now()

  res.json({
    subscriptionStatus: student.subscriptionStatus,
    subscriptionExpiryDate: student.subscriptionExpiryDate,
    isActive: active,
  })
})

export default router

