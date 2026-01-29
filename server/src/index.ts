import 'dotenv/config'
import 'express-async-errors' // Handle async errors
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
// Serve uploads
const uploadsDir = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'public/uploads')

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true })
  } catch (err) {
    console.error('Failed to create uploads directory:', err)
  }
}
// Serve static files if not in tmp (Vercel doesn't persist /tmp between requests mostly, but prevents crash)
// In production Vercel, this won't actually serve files uploaded previously, needing S3/Cloudinary.
// But this prevents the crash on startup.
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(uploadsDir))
}

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
        // Don't exit, just let it fail at query time so we can return nice JSON error
        return
      }
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
      console.log('Using in-memory MongoDB')
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
      console.log('MongoDB connected')
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

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global Error:', err)
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

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

