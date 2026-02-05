import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import type { Role } from '../types/index.js'

export type AuthedRequest = Request & {
    user?: {
        id: string
        role: Role
    }
}

export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const header = req.headers.authorization
        if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })
        const token = header.slice('Bearer '.length)
        const secret = process.env.JWT_SECRET
        if (!secret) return res.status(500).json({ error: 'JWT_SECRET not set' })

        const payload = jwt.verify(token, secret) as { sub: string; role: Role }
        req.user = { id: payload.sub, role: payload.role }

        // ensure user still exists
        const exists = await User.exists({ _id: payload.sub })
        if (!exists) return res.status(401).json({ error: 'Invalid token' })

        next()
    } catch {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

export const requireRole =
    (...roles: Role[]) =>
        (req: AuthedRequest, res: Response, next: NextFunction) => {
            if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
            if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
            next()
        }

export const requireActiveSubscription = async (
    req: AuthedRequest,
    res: Response,
    next: NextFunction,
) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' })

    const student = await User.findById(req.user.id).select('subscriptionStatus subscriptionExpiryDate')
    if (!student) return res.status(401).json({ error: 'Unauthorized' })

    const exp = student.subscriptionExpiryDate ? new Date(student.subscriptionExpiryDate) : null
    const active = student.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now()
    if (!active) return res.status(402).json({ error: 'Subscription required' })

    next()
}
