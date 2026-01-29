export default function handler(req: any, res: any) {
    res.status(200).json({
        status: 'Alive',
        env: process.env.NODE_ENV,
        time: new Date().toISOString(),
        message: 'If you see this, Vercel is working. The crash is in src/index.ts'
    });
}
