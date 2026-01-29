import mongoose, { Schema } from 'mongoose';
const subjectSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isPremium: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Subject', subjectSchema);
