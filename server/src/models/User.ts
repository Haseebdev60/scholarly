import mongoose, { Schema, type InferSchemaType } from 'mongoose'
// import bcrypt from 'bcryptjs'
import type { Role, SubscriptionStatus } from '../types'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['student', 'teacher', 'admin'] satisfies Role[] },

    // Student
    subscriptionStatus: {
      type: String,
      enum: ['free', 'weekly', 'monthly'] satisfies SubscriptionStatus[],
      default: 'free',
    },
    subscriptionExpiryDate: { type: Date, default: null },
    enrolledSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject', default: [] }],

    // Teacher
    approved: { type: Boolean, default: false },
    assignedSubjects: [{ type: Schema.Types.ObjectId, ref: 'Subject', default: [] }],
    bio: { type: String },
    avatar: { type: String },
    hourlyRate: { type: Number, default: 2000 },
    availability: [{
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      slots: [{
        startTime: String, // HH:mm
        endTime: String,   // HH:mm
        duration: Number   // minutes (redundant if inferred, but good for explicit slots)
      }]
    }],
  },
  { timestamps: true },
)

// userSchema.pre('save', async function (next: any) {
//   if (!this.isModified('password')) return next()
//   try {
//     const salt = await bcrypt.genSalt(10)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (err) {
//     next(err)
//   }
// })

userSchema.methods.comparePassword = async function comparePassword(candidate: string) {
  return false // bcrypt.compare(candidate, (this as any).password)
}

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId
  comparePassword: (candidate: string) => Promise<boolean>
}

export default mongoose.model<UserDoc>('User', userSchema)
