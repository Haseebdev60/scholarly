import mongoose, { Schema, type InferSchemaType } from 'mongoose'
import type { ClassType } from '../types'

const classSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    classType: { type: String, enum: ['live', 'recorded'] satisfies ClassType[], required: true },
    meetingLink: { type: String },
    isSubscriptionRequired: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export type ClassDoc = InferSchemaType<typeof classSchema> & { _id: mongoose.Types.ObjectId }

export default mongoose.model<ClassDoc>('Class', classSchema)

