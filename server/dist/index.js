"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
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
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // Check if origin is allowed or if it's a Vercel preview deployment
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use((0, morgan_1.default)('dev'));
// Serve uploads
const uploadsDir = path_1.default.join(process.cwd(), 'public/uploads'); // Use process.cwd() for flexibility
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsDir));
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
                return;
            }
            const mem = await mongodb_memory_server_1.MongoMemoryServer.create();
            uri = mem.getUri();
            console.log('Using in-memory MongoDB');
        }
        if (mongoose_1.default.connection.readyState === 0) {
            await mongoose_1.default.connect(uri);
            console.log('MongoDB connected');
            // Seeding logic can go here (simplified for cloud function)
            // Checks ...
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
else {
    // Just connect DB for serverless
    connectDB();
}
