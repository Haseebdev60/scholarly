import mongoose, { Schema } from 'mongoose';
const classSchema = new Schema({
    title: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    classType: { type: String, enum: ['live', 'recorded'], required: true },
    meetingLink: { type: String },
    isSubscriptionRequired: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('Class', classSchema);
