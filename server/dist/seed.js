"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const Subject_1 = __importDefault(require("./models/Subject"));
// Sample data
const subjects = [
    {
        title: 'Advanced Mathematics',
        description: 'Master calculus, algebra, and trigonometry with expert guidance.',
        isPremium: true
    },
    {
        title: 'Physics Fundamentals',
        description: 'Explore mechanics, thermodynamics, and electromagnetism.',
        isPremium: true
    },
    {
        title: 'Introductory Chemistry',
        description: 'Build a strong foundation in chemical principles and reactions.',
        isPremium: true
    },
    {
        title: 'English Literature',
        description: 'Analyze classic texts and improve your critical reading skills.',
        isPremium: true
    },
    {
        title: 'Computer Science 101',
        description: 'Learn the basics of programming and algorithms.',
        isPremium: true
    }
];
const seed = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        let uri = MONGO_URI;
        if (!uri) {
            // Fallback to local memory server logic if needed, 
            // but ideally we want to connect to the RUNNING server's db.
            // However, for a simple local setup, usually we use the exact same URI.
            // If the main server is using MongoMemoryServer and printing a dynamic URI, we can't easily connect to it from a separate process unless we know the URI.
            // But usually in these setups either a local mongo is running or we just spin up a new one for dev.
            // WAIT. If the main server is using In-Memory, every restart wipes it.
            // If I run this script separately, it starts its OWN in-memory DB, seeds IT, and then exits. The main server won't see it (separate process).
            // 
            // SOLUTION: I should check if there is a way to persist or if I should add a /seed route to the server itself.
            // Attempting to connect to standard localhost:27017 first if env is missing.
            uri = 'mongodb://localhost:27017/a3';
        }
        console.log('Connecting to:', uri);
        // Try connecting. 
        // Note: If the main server is using MongoMemoryServer, we likely can't "seed" it from outside unless the main server EXPOSES a seed endpoint.
        // Or we restart the main server with a persistent path.
        // Given the code in index.ts: "using in-memory MongoDB for dev (no MONGO_URI)"
        // This confirms the data is ephemeral.
        // 
        // Strategy Change: I cannot use a separate script if the DB is in-memory and isolated in the main process.
        // I must ADD a seeding function to the main server startup or a route.
        // I will add a temporary seed route or check on startup.
        await mongoose_1.default.connect(uri);
        console.log('Connected to MongoDB');
        await Subject_1.default.deleteMany({});
        console.log('Cleared existing subjects');
        await Subject_1.default.insertMany(subjects);
        console.log('Inserted subjects');
        console.log('Done!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};
// seed()
// Commenting out execution here. I realized I should not run this as a standalone script if the DB is in-memory.
// See below for new plan.
