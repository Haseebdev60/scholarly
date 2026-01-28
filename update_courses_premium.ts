
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './server/src/models/Subject';

dotenv.config({ path: './server/.env' });

async function makeAllCoursesPremium() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management');
        console.log('Connected.');

        const result = await Subject.updateMany({}, { isPremium: true });
        console.log(`Updated ${result.modifiedCount} courses to premium.`);
        console.log('Matched count:', result.matchedCount);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

makeAllCoursesPremium();
