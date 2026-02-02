console.log('[DEBUG] Starting api/index.ts (Auth Migration Phase)')
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

// Local Route Imports (ESM)
import authRoutes from './routes/auth.routes.js'

// import publicRoutes from '../server/src/routes/public.routes'
// app.use('/api', publicRoutes)

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
app.get('/', (_req, res) => res.json({ message: 'Backend is running (Auth Phase)' }))
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'Auth Phase', timestamp: new Date().toISOString() }))

// Diagnostic Route to inspect file system
app.get('/api/debug-files', (_req, res) => {
    try {
        const cwd = process.cwd()
        const possiblePaths = [
            path.join(cwd, 'api', 'models'),
            path.join(cwd, 'server', 'src', 'models'),
            path.join(cwd, 'api'),
            cwd
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
        res.json({ env: process.env.NODE_ENV, cwd, scan: results })
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
app.use('/api/auth', authRoutes)

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
