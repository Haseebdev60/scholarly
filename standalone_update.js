
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'server/.env') });

const subjectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        isPremium: { type: Boolean, default: false },
    },
    { timestamps: true },
)

const Subject = mongoose.model('Subject', subjectSchema)

async function run() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/school-management';
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('Connected.');

        const res = await Subject.updateMany({}, { $set: { isPremium: true } });
        console.log('Update result:', res);

        const count = await Subject.countDocuments({ isPremium: false });
        console.log('Remaining free courses:', count);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
