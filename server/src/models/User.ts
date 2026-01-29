import mongoose, { Schema, type InferSchemaType } from 'mongoose'
// import bcrypt from 'bcryptjs'

// ...

// userSchema.pre('save', async function (next: any) {
//   if (!this.isModified('password')) return next()
//   try {
//     // const salt = await bcrypt.genSalt(10)
//     // this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (err) {
//     next(err)
//   }
// })

// userSchema.methods.comparePassword = async function comparePassword(candidate: string) {
//   return false // bcrypt.compare(candidate, (this as any).password)
// }

export type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId
  comparePassword: (candidate: string) => Promise<boolean>
}

export default mongoose.model<UserDoc>('User', userSchema)

