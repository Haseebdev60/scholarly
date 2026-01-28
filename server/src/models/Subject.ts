import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const subjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export type SubjectDoc = InferSchemaType<typeof subjectSchema> & { _id: mongoose.Types.ObjectId }

export default mongoose.model<SubjectDoc>('Subject', subjectSchema)

