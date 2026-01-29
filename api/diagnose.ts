import fs from 'fs'
import path from 'path'
// import { VercelRequest, VercelResponse } from '@vercel/node'

export default function (req: any, res: any) {
    try {
        // Navigate up from 'api' folder to root, then into 'server/src/models'
        // Vercel structure is usually: /var/task/api/diagnose.js (entry)
        // Source files might be in /var/task/server/src/models OR bundled differently.

        const possiblePaths = [
            path.join(process.cwd(), 'server', 'src', 'models'),
            path.join(__dirname, '..', 'server', 'src', 'models'),
            path.join(__dirname, '..', '..', 'server', 'src', 'models'),
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

        res.json({
            status: 'Alive',
            env: process.env.NODE_ENV,
            cwd: process.cwd(),
            dirname: __dirname,
            fileSystemScan: results
        })
    } catch (err: any) {
        res.status(500).json({ error: err.message })
    }
}
