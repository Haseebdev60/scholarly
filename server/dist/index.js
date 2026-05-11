"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("express-async-errors"); // Handle async errors
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const teacher_routes_1 = __importDefault(require("./routes/teacher.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const subject_routes_1 = __importDefault(require("./routes/subject.routes"));
// ...
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const Subject_1 = __importDefault(require("./models/Subject"));
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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || '',
];
app.use((0, cors_1.default)({
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
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, morgan_1.default)('dev'));
// Serve uploads
// Serve uploads
const uploadsDir = process.env.NODE_ENV === 'production'
    ? path_1.default.join('/tmp', 'uploads')
    : path_1.default.join(process.cwd(), 'public/uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    try {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    catch (err) {
        console.error('Failed to create uploads directory:', err);
    }
}
// Serve static files if not in tmp (Vercel doesn't persist /tmp between requests mostly, but prevents crash)
// In production Vercel, this won't actually serve files uploaded previously, needing S3/Cloudinary.
// But this prevents the crash on startup.
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express_1.default.static(uploadsDir));
}
app.get('/', (_req, res) => res.json({ message: 'Backend is running' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', public_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/subscriptions', subscription_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/subjects', subject_routes_1.default);
app.use('/api/teacher', teacher_routes_1.default);
app.use('/api/student', student_routes_1.default);
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
            const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            const mem = await MongoMemoryServer.create();
            uri = mem.getUri();
            console.log('Using in-memory MongoDB');
        }
        if (mongoose_1.default.connection.readyState === 0) {
            // Ensure uri is defined, which it is by logic above or initial assignment
            if (uri) {
                await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
                console.log('MongoDB connected');
            }
        }
    }
    catch (err) {
        console.error('MongoDB connection error', err);
    }
};
// Start Cron (ensure it doesn't run multiple times in serverless, or use a dedicated cron job)
const cron_1 = require("./cron");
// Only start cron in long-running process, serverless might accept it but it won't persist
if (process.env.NODE_ENV !== 'production') {
    (0, cron_1.startCron)();
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
    if (mongoose_1.default.connection.readyState === 0 || mongoose_1.default.connection.readyState === 99) {
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
// Export app for Vercel
exports.default = app;
// Start Server if not on Vercel
if (process.env.NODE_ENV !== 'production') {
    connectDB().then(() => {
        // Basic seeding
        Subject_1.default.countDocuments().then(async (count) => {
            if (count === 0 && seedData)
                await Subject_1.default.insertMany(seedData);
        });
        app.listen(PORT, () => {
            console.log(`API running on http://localhost:${PORT}`);
        });
    });
}
