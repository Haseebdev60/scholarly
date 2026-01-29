console.log('[DEBUG] Starting server/src/index.ts')
// import 'dotenv/config' <-- Commenting this out
import express from 'express'
// import cors from 'cors'
// import morgan from 'morgan'
// import mongoose from 'mongoose' <-- Commenting this out!

const app = express()

// Basic CORS replacement
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/', (_req, res) => res.json({ message: 'Backend is running (Ultra Safe)' }))
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'Ultra Safe', timestamp: new Date().toISOString() }))

export default app
