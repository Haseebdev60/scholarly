console.log('[DEBUG] Starting api/index.ts (Full Migration)')
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import morgan from 'morgan'

// Routes (ESM Imports with .js)
import authRoutes from './routes/auth.routes.js'
import studentRoutes from './routes/student.routes.js'
import teacherRoutes from './routes/teacher.routes.js'
import adminRoutes from './routes/admin.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js'
import subjectRoutes from './routes/subject.routes.js'
import publicRoutes from './routes/public.routes.js'

// --- ESM FIXES ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(morgan('dev'))
app.use(express.json())

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    process.env.VITE_API_URL,
    'https://scholarly-frontend.vercel.app'
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.some(o => origin.startsWith(o as string))) {
            callback(null, true)
        } else {
            console.log('[CORS] Blocked:', origin)
            callback(null, false) // Strict for prod
        }
    },
    credentials: true
}))

// Database
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) return
        await mongoose.connect(process.env.MONGO_URI || '')
        console.log('[MongoDB] Connected')
    } catch (err) {
        console.error('[MongoDB] Error:', err)
    }
}
connectDB()

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
    res.json({ ok: true, mode: 'Full Migration Phase' })
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
