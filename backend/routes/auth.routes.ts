import { Router } from 'express'
import User from '../models/User.js'
import { signToken, verifyToken } from '../utils/jwt.js'
import type { Role } from '../types/index.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body ?? {}
        if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' })
        if (!['student', 'teacher', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' })

        const existing = await User.findOne({ email })
        if (existing) return res.status(409).json({ error: 'Email already in use' })

        const doc = await User.create({
            name,
            email,
            password,
            role: role as Role,
            approved: role === 'teacher' ? false : true,
            subscriptionStatus: role === 'student' ? 'free' : undefined,
        })

        const token = signToken(doc._id.toString(), doc.role as Role)
        res.status(201).json({
            token,
            user: { id: doc._id, name: doc.name, email: doc.email, role: doc.role, approved: doc.approved, avatar: doc.avatar },
        })
    } catch (err: any) {
        console.error('Register Error:', err)
        res.status(500).json({ error: err.message || 'Registration failed' })
    }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body ?? {}
        if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

        const user = await User.findOne({ email }).select('+password')
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        const ok = await user.comparePassword(password)
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

        const token = signToken(user._id.toString(), user.role as Role)
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved, avatar: user.avatar },
        })
    } catch (err: any) {
        console.error('Login Error:', err)
        res.status(500).json({ error: err.message || 'Login failed' })
    }
})

// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    try {
        const decoded = verifyToken(token)
        if (!decoded) return res.status(401).json({ error: 'Invalid token' })

        const { name, avatar } = req.body
        if (!name) return res.status(400).json({ error: 'Name is required' })

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { name, avatar },
            { new: true }
        )

        if (!user) return res.status(404).json({ error: 'User not found' })

        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved, avatar: user.avatar }
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' })
    }
})

export default router
