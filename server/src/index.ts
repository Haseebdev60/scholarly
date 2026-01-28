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
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(morgan('dev'))

// Serve uploads
const uploadsDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/subjects', subjectRoutes) // Admin Subject Management
app.use('/api/teacher', teacherRoutes)
app.use('/api/student', studentRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

const start = async () => {
  try {
    let uri = MONGO_URI

    const connectWithFallback = async () => {
      // If no MONGO_URI provided, use an in-memory MongoDB for local dev.
      if (!uri) {
        const mem = await MongoMemoryServer.create()
        uri = mem.getUri()
        // eslint-disable-next-line no-console
        console.log('Using in-memory MongoDB for dev (no MONGO_URI)')
      }

      try {
        await mongoose.connect(uri)
      } catch (err) {
        // If local/remote Mongo is unreachable, fall back to in-memory MongoDB.
        const mem = await MongoMemoryServer.create()
        uri = mem.getUri()
        // eslint-disable-next-line no-console
        console.log('Mongo unreachable; using in-memory MongoDB for dev fallback')
        await mongoose.connect(uri)
      }
    }

    await connectWithFallback()
    // eslint-disable-next-line no-console
    console.log('MongoDB connected')

    // Auto-seed if empty
    const count = await Subject.countDocuments()
    if (count === 0) {
      console.log('Seeding initial data...')
      await Subject.insertMany(seedData)
      console.log('Seeded subjects!')
      console.log('Seeded subjects!')
    }

    // Auto-seed Admin
    const adminExists = await User.findOne({ role: 'admin' })
    if (!adminExists) {
      console.log('Seeding admin user...')
      await User.create({
        name: 'Super Admin',
        email: 'admin@scholarly.com',
        password: 'secret', // Plain text for dev/demo purposes as requested
        role: 'admin',
        approved: true,
      })
      console.log('Seeded admin: admin@scholarly.com / secret')
    }

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${PORT}`)
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', err)
    process.exit(1)
  }
}

// Start Cron
import { startCron } from './cron'
startCron()

start()

