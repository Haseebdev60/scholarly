import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const questionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: false },
)

const quizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    questions: { type: [questionSchema], default: [] },
    isPremium: { type: Boolean, default: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' }, // Optional for AI generated or explicit assignment
  },
  { timestamps: true },
)

export type QuizDoc = InferSchemaType<typeof quizSchema> & { _id: mongoose.Types.ObjectId }

export default mongoose.model<QuizDoc>('Quiz', quizSchema)

