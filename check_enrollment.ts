
import mongoose from 'mongoose';
import User from './server/src/models/User';
import Subject from './server/src/models/Subject';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function check() {
    try {
        console.log('Connecting to DB...');
        // hardcode or use env. Assuming standard local mongo if no env
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management');
        console.log('Connected.');

        const students = await User.find({ role: 'student' }).populate('enrolledSubjects');
        console.log(`Found ${students.length} students.`);

        for (const s of students) {
            console.log(`Student: ${s.name} (${s.email})`);
            console.log(`Enrolled Subjects Raw:`, s.enrolledSubjects);
            if (s.enrolledSubjects && s.enrolledSubjects.length > 0) {
                console.log(' - Has subjects!');
            } else {
                console.log(' - No subjects.');
            }
        }

        // Just to be sure, check if there are any subjects at all
        const subjects = await Subject.find();
        console.log(`Total subjects in DB: ${subjects.length}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
