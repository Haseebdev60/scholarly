import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import authRoutes from './routes/auth.routes'
import subscriptionRoutes from './routes/subscription.routes'
import adminRoutes from './routes/admin.routes'
import teacherRoutes from './routes/teacher.routes'
import studentRoutes from './routes/student.routes'
import subjectRoutes from './routes/subject.routes'

// ...

import publicRoutes from './routes/public.routes'
import Subject from './models/Subject'
import User from './models/User'

// Seed Data
const seedData = [
  {
    title: 'Advanced Mathematics',
    description: 'Master calculus, algebra, and trigonometry with expert guidance.',
    isPremium: true,
  },
  {
    title: 'Physics Fundamentals',
    description: 'Explore mechanics, thermodynamics, and electromagnetism.',
    isPremium: true,
  },
  {
    title: 'Introductory Chemistry',
    description: 'Build a strong foundation in chemical principles and reactions.',
    isPremium: true,
  },
  {
    title: 'English Literature',
    description: 'Analyze classic texts and improve your critical reading skills.',
    isPremium: true,
  },
  {
    title: 'Computer Science 101',
    description: 'Learn the basics of programming and algorithms.',
    isPremium: true,
  },
]

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI

import path from 'path'
import fs from 'fs'

const app = express()

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)

    // Check if origin is allowed or if it's a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

// Serve uploads
const uploadsDir = path.join(process.cwd(), 'public/uploads') // Use process.cwd() for flexibility
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/student', studentRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// DB Connection
const connectDB = async () => {
  try {
    let uri = MONGO_URI

    // Fallback logic
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('MONGO_URI is missing in production!')
        return
      }
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
      console.log('Using in-memory MongoDB')
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri)
      console.log('MongoDB connected')

      // Seeding logic can go here (simplified for cloud function)
      // Checks ...
    }
  } catch (err) {
    console.error('MongoDB connection error', err)
  }
}

// Start Cron (ensure it doesn't run multiple times in serverless, or use a dedicated cron job)
import { startCron } from './cron'
// Only start cron in long-running process, serverless might accept it but it won't persist
if (process.env.NODE_ENV !== 'production') {
  startCron()
}

// Export app for Vercel
export default app

// Start Server if not on Vercel
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    // Basic seeding
    Subject.countDocuments().then(async count => {
      if (count === 0 && seedData) await Subject.insertMany(seedData)
    })

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`)
    })
  })
} else {
  // Just connect DB for serverless
  connectDB()
}

