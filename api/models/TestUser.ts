import mongoose from 'mongoose'

const testUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
    },
    { timestamps: true },
)

export default mongoose.models.TestUser || mongoose.model('TestUser', testUserSchema)
