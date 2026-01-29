console.log('[DEBUG] Starting server/src/index.ts')
import 'dotenv/config'
console.log('[DEBUG] dotenv loaded')

import express from 'express'
console.log('[DEBUG] express imported')
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
console.log('[DEBUG] mongoose imported')

// import authRoutes from './routes/auth.routes'
// import subscriptionRoutes from './routes/subscription.routes'
// import adminRoutes from './routes/admin.routes'
// import teacherRoutes from './routes/teacher.routes'
// import studentRoutes from './routes/student.routes'
// import subjectRoutes from './routes/subject.routes'

import publicRoutes from './routes/public.routes'
import Subject from './models/Subject'

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
    const allowed = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
    if (!origin || allowed.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
      callback(null, true)
    } else {
      console.error(`CORS Blocked: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

// DB Connection Logic
const connectDB = async () => {
  try {
    let uri = MONGO_URI
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('MONGO_URI is missing in production!')
        return
      }
      const { MongoMemoryServer } = await import('mongodb-memory-server')
      const mem = await MongoMemoryServer.create()
      uri = mem.getUri()
      console.log('Using in-memory MongoDB')
    }

    if (mongoose.connection.readyState === 0) {
      if (uri) {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
        console.log('MongoDB connected')
      }
    }
  } catch (err) {
    console.error('MongoDB connection error', err)
  }
}

// Health Checks (No DB)
app.get('/', (_req, res) => res.json({ message: 'Backend is running' }))
app.get('/api/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }))

// Middleware to ensure DB connection
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 99) {
    try {
      await connectDB()
    } catch (err) {
      console.error('DB Connect Middleware Error:', err)
      throw err
    }
  }
  next()
})

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
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(uploadsDir))
}

// COMMENTED OUT ROUTES FOR DEBUGGING
// app.use('/api', publicRoutes)
// app.use('/api/auth', authRoutes)
// app.use('/api/subscriptions', subscriptionRoutes)
// app.use('/api/admin', adminRoutes)
// app.use('/api/subjects', subjectRoutes)
// app.use('/api/teacher', teacherRoutes)
// app.use('/api/student', studentRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// import { startCron } from './cron'
// if (process.env.NODE_ENV !== 'production') {
//   startCron()
// }

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global Error:', err)
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

export default app

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    Subject.countDocuments().then(async count => {
      if (count === 0 && seedData) await Subject.insertMany(seedData)
    })
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`)
    })
  })
}
