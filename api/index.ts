import express from 'express'
// import app from '../server/src/index' <--- Bypass this

const app = express()

app.get('/', (req, res) => res.json({ message: 'Backend (Direct in API) is running' }))
app.get('/api/health', (req, res) => res.json({
    ok: true,
    mode: 'Direct API',
    timestamp: new Date().toISOString()
}))

export default app
