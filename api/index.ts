console.log('[DEBUG] Starting api/index.ts (Full App)')
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

// Import Routes (Adjusted Paths)
import authRoutes from '../server/src/routes/auth.routes'
// import subscriptionRoutes from '../server/src/routes/subscription.routes'
// import adminRoutes from '../server/src/routes/admin.routes'
// import teacherRoutes from '../server/src/routes/teacher.routes'
// import studentRoutes from '../server/src/routes/student.routes'
import subjectRoutes from '../server/src/routes/subject.routes'
import publicRoutes from '../server/src/routes/public.routes'

// Import Models
import Subject from '../server/src/models/Subject'
import User from '../server/src/models/User'
// import Debug from '../server/src/models/Debug'
console.log('DEBUG: User model imported', User ? 'OK' : 'FAIL')

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

const MONGO_URI = process.env.MONGO_URI

const app = express()

// CORS Configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
        if (!origin || allowed.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
            callback(null, true)
        } else {
            console.log(`[CORS WARN] Blocked: ${origin}`)
            // callback(new Error('Not allowed by CORS')) // Don't crash, just log warning for now
            callback(null, false)
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
            console.error('MONGO_URI is missing!')
            return
        }

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
            console.log('MongoDB connected')
        }
    } catch (err) {
        console.error('MongoDB connection error', err)
    }
}

// Health Checks
app.get('/', (_req, res) => res.json({ message: 'Backend is running (Full App in API)' }))
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'Full API', timestamp: new Date().toISOString() }))

// Diagnostic Route to inspect file system
app.get('/api/debug-files', (_req, res) => {
    try {
        const possiblePaths = [
            path.join(process.cwd(), 'server', 'src', 'models'),
            path.join(__dirname, '..', 'server', 'src', 'models'),
            path.join(process.cwd(), 'api'),
            process.cwd()
        ]
        const results: any = {}
        possiblePaths.forEach(p => {
            try {
                if (fs.existsSync(p)) {
                    results[p] = fs.readdirSync(p)
                } else {
                    results[p] = 'NOT FOUND'
                }
            } catch (err: any) {
                results[p] = `ERROR: ${err.message}`
            }
        })
        res.json({ env: process.env.NODE_ENV, scan: results })
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
})

// Middleware to ensure DB connection
app.use(async (_req, _res, next) => {
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 99) {
        try {
            await connectDB()
        } catch (err) {
            console.error('DB Connect Middleware Error:', err)
        }
    }
    next()
})

// Routes
// app.use('/api', publicRoutes)
// // app.use('/api/auth', authRoutes)
// app.use('/api/subscriptions', subscriptionRoutes)
// app.use('/api/admin', adminRoutes)
// app.use('/api/subjects', subjectRoutes)
// app.use('/api/teacher', teacherRoutes)
// app.use('/api/student', studentRoutes)

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Global Error:', err)
    res.status(500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })
})

export default app
