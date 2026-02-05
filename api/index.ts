console.log('[DEBUG] Starting api/index.ts (Refactored Backend)')
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import morgan from 'morgan'

// Routes (Import from backend/ folder)
import authRoutes from '../backend/routes/auth.routes.js'
import studentRoutes from '../backend/routes/student.routes.js'
import teacherRoutes from '../backend/routes/teacher.routes.js'
import adminRoutes from '../backend/routes/admin.routes.js'
import subscriptionRoutes from '../backend/routes/subscription.routes.js'
import subjectRoutes from '../backend/routes/subject.routes.js'
import publicRoutes from '../backend/routes/public.routes.js'

// --- ESM FIXES ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.VITE_API_URL,
    'https://scholarly-frontend.vercel.app'
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests from Vercel deployments and localhost
        if (!origin || allowedOrigins.some(o => origin.startsWith(o as string)) || origin.endsWith('.vercel.app')) {
            callback(null, true)
        } else {
            console.log('[CORS] Blocked:', origin)
            callback(null, false)
        }
    },
    credentials: true
}))

// Database
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return
        }
        console.log('[MongoDB] Connecting...')
        await mongoose.connect(process.env.MONGO_URI || '', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })
        console.log('[MongoDB] Connected')
    } catch (err) {
        console.error('[MongoDB] Error:', err)
        throw err
    }
}
// connectDB() - REMOVED floating call

// Ensure DB is connected before processing
app.use(async (req, res, next) => {
    // Skip health check to allow debugging even if DB fails
    if (req.path === '/api/health') return next()

    if (mongoose.connection.readyState === 1) return next()

    try {
        await connectDB()
        next()
    } catch (err: any) {
        console.error('[DB Middleware] Failed:', err)
        res.status(500).json({ error: 'Database Connection Failed', details: err.message })
    }
})

// --- ROUTES ---
app.use('/api/auth', authRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/public', publicRoutes)

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, mode: 'Full Migration Phase (Refactored)' })
})

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error]', err)
    res.status(500).json({ error: err.message || 'Internal Server Error' })
})

// Export for Vercel
export default app

// Local Dev Server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`[API] Running on port ${PORT}`))
}
