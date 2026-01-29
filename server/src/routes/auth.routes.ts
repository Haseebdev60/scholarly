import { Router } from 'express'
// import User from '../models/User'
// import { signToken, verifyToken } from '../utils/jwt'
// import type { Role } from '../types'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ message: 'Auth Route is Alive (Dummy Mode)' })
})

// POST /api/auth/register
// router.post('/register', async (req, res) => {
//     res.json({ message: 'Register temporarily disabled' })
// })

// POST /api/auth/login
// router.post('/login', async (req, res) => {
//     res.json({ message: 'Login temporarily disabled' })
// })

// PUT /api/auth/update-profile
// router.put('/update-profile', async (req, res) => {
//     res.json({ message: 'Update Profile temporarily disabled' })
// })

export default router
