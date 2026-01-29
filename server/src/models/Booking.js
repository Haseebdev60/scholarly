import mongoose, { Schema } from 'mongoose';
const bookingSchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    date: { type: Date, required: true }, // The specific date and time of the booking
    duration: { type: Number, required: true }, // in minutes
    status: {
        type: String,
        enum: ['pending_payment', 'confirmed', 'completed', 'cancelled', 'expired'],
        default: 'pending_payment'
    },
    price: { type: Number, required: true },
    meetingLink: { type: String },
    notes: { type: String }
}, { timestamps: true });
// Index to find overlapping bookings for a teacher
bookingSchema.index({ teacherId: 1, date: 1 });
export default mongoose.model('Booking', bookingSchema);
