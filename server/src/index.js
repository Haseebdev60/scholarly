import 'dotenv/config';
import 'express-async-errors'; // Handle async errors
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import subscriptionRoutes from './routes/subscription.routes';
import adminRoutes from './routes/admin.routes';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import subjectRoutes from './routes/subject.routes';
// ...
import publicRoutes from './routes/public.routes';
import Subject from './models/Subject';
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
];
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
import path from 'path';
import fs from 'fs';
const app = express();
// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || '',
];
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
        // Allow server-to-server or mobile (no origin) if needed, otherwise strict
        if (!origin || allowed.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
            callback(null, true);
        }
        else {
            console.error(`CORS Blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));
// Serve uploads
// Serve uploads
const uploadsDir = process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    catch (err) {
        console.error('Failed to create uploads directory:', err);
    }
}
// Serve static files if not in tmp (Vercel doesn't persist /tmp between requests mostly, but prevents crash)
// In production Vercel, this won't actually serve files uploaded previously, needing S3/Cloudinary.
// But this prevents the crash on startup.
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express.static(uploadsDir));
}
app.get('/', (_req, res) => res.json({ message: 'Backend is running' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
// DB Connection
const connectDB = async () => {
    try {
        let uri = MONGO_URI;
        // Fallback logic
        if (!uri) {
            if (process.env.NODE_ENV === 'production') {
                console.error('MONGO_URI is missing in production!');
                // Don't exit, just let it fail at query time so we can return nice JSON error
                return;
            }
            // Dynamic import to prevent crash in production where devDeps are pruned
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mem = await MongoMemoryServer.create();
            uri = mem.getUri();
            console.log('Using in-memory MongoDB');
        }
        if (mongoose.connection.readyState === 0) {
            // Ensure uri is defined, which it is by logic above or initial assignment
            if (uri) {
                await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
                console.log('MongoDB connected');
            }
        }
    }
    catch (err) {
        console.error('MongoDB connection error', err);
    }
};
// Start Cron (ensure it doesn't run multiple times in serverless, or use a dedicated cron job)
import { startCron } from './cron';
// Only start cron in long-running process, serverless might accept it but it won't persist
if (process.env.NODE_ENV !== 'production') {
    startCron();
}
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Global Error:', err);
    res.status(500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// Middleware to ensure DB connection
app.use(async (_req, _res, next) => {
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 99) {
        try {
            await connectDB();
        }
        catch (err) {
            console.error('DB Connect Middleware Error:', err);
            // Let the global handler take it
            throw err;
        }
    }
    next();
});
import User from './models/User';
import bcrypt from 'bcryptjs';

// Export app for Vercel
export default app;
// Start Server if not on Vercel
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        // Basic seeding
        Subject.countDocuments().then(async (count) => {
            if (count === 0 && seedData) {
                await Subject.insertMany(seedData);
            }
            
            // Seed teachers if none exist
            const teacherCount = await User.countDocuments({ role: 'teacher' });
            if (teacherCount === 0) {
                const hashedPassword = await bcrypt.hash('secret', 10);
                
                const teachersToSeed = [
                    {
                        name: 'Dr. Sarah Jenkins',
                        email: 'sarah.jenkins@scholarly.com',
                        password: hashedPassword,
                        role: 'teacher',
                        approved: true,
                        bio: 'Dr. Sarah Jenkins has a PhD in Applied Mathematics. She has been teaching advanced calculus and physics for over a decade.',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                        hourlyRate: 2500,
                        availability: [
                            { day: 'Monday', slots: [{ startTime: '09:00', endTime: '12:00', duration: 180 }] },
                            { day: 'Wednesday', slots: [{ startTime: '14:00', endTime: '17:00', duration: 180 }] }
                        ]
                    },
                    {
                        name: 'Prof. Albert Vance',
                        email: 'albert.vance@scholarly.com',
                        password: hashedPassword,
                        role: 'teacher',
                        approved: true,
                        bio: 'Prof. Albert Vance is a chemistry and computer science enthusiast. He loves making complex programming and chemical concepts simple.',
                        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                        hourlyRate: 2000,
                        availability: [
                            { day: 'Tuesday', slots: [{ startTime: '10:00', endTime: '13:00', duration: 180 }] },
                            { day: 'Thursday', slots: [{ startTime: '15:00', endTime: '18:00', duration: 180 }] }
                        ]
                    },
                    {
                        name: 'Helen Miller',
                        email: 'helen.miller@scholarly.com',
                        password: hashedPassword,
                        role: 'teacher',
                        approved: true,
                        bio: 'Helen Miller is an English literature professor who specializes in classical analysis and critical reading skills.',
                        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                        hourlyRate: 1800,
                        availability: [
                            { day: 'Friday', slots: [{ startTime: '09:00', endTime: '12:00', duration: 180 }] }
                        ]
                    }
                ];

                const createdTeachers = await User.insertMany(teachersToSeed);

                // Now link subjects to teachers and vice versa
                const mathSubject = await Subject.findOne({ title: 'Advanced Mathematics' });
                const physicsSubject = await Subject.findOne({ title: 'Physics Fundamentals' });
                const chemSubject = await Subject.findOne({ title: 'Introductory Chemistry' });
                const csSubject = await Subject.findOne({ title: 'Computer Science 101' });
                const engSubject = await Subject.findOne({ title: 'English Literature' });

                const sarah = createdTeachers[0];
                const albert = createdTeachers[1];
                const helen = createdTeachers[2];

                if (mathSubject) {
                    mathSubject.teacherId = sarah._id;
                    await mathSubject.save();
                    sarah.assignedSubjects.push(mathSubject._id);
                }
                if (physicsSubject) {
                    physicsSubject.teacherId = sarah._id;
                    await physicsSubject.save();
                    sarah.assignedSubjects.push(physicsSubject._id);
                }
                await sarah.save();

                if (chemSubject) {
                    chemSubject.teacherId = albert._id;
                    await chemSubject.save();
                    albert.assignedSubjects.push(chemSubject._id);
                }
                if (csSubject) {
                    csSubject.teacherId = albert._id;
                    await csSubject.save();
                    albert.assignedSubjects.push(csSubject._id);
                }
                await albert.save();

                if (engSubject) {
                    engSubject.teacherId = helen._id;
                    await engSubject.save();
                    helen.assignedSubjects.push(engSubject._id);
                    await helen.save();
                }
                console.log('Seeded teachers and linked them to subjects!');
            }
        });
        app.listen(PORT, () => {
            console.log(`API running on http://localhost:${PORT}`);
        });
    });
}
