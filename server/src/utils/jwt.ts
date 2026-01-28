import jwt from 'jsonwebtoken'
import type { Role } from '../types'

export const signToken = (userId: string, role: Role) => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any
  return jwt.sign({ role }, secret, { subject: userId, expiresIn } as jwt.SignOptions)
}

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not set')
  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload
    return { id: decoded.sub as string, role: decoded.role as Role }
  } catch (err) {
    return null
  }
}

