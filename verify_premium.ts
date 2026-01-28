
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './server/src/models/Subject';

dotenv.config({ path: './server/.env' });

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management');
        const count = await Subject.countDocuments({ isPremium: false });
        console.log(`Number of non-premium courses: ${count}`);
        const total = await Subject.countDocuments();
        console.log(`Total courses: ${total}`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
