console.log('[DEBUG] Starting server/src/index.ts')
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'

// --- COMMENTED OUT EVERYTHING POTENTIALLY DANGEROUS ---
// import publicRoutes from './routes/public.routes'
// import Subject from './models/Subject'
// import path from 'path'
// import fs from 'fs'

const app = express()

// Basic CORS
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// --- NO DB MIDDLEWARE ---
// --- NO UPLOADS LOGIC ---

// HEALTH CHECK
app.get('/', (_req, res) => res.json({ message: 'Backend is running (Safe Mode)' }))
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'Safe', timestamp: new Date().toISOString() }))

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global Error:', err)
  res.status(500).json({ error: err.message })
})

export default app
