import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const messageSchema = new Schema(
    {
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        recipientName: { type: String, required: true },
        subject: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        read: { type: Boolean, default: false },
    },
    { timestamps: true },
)

export type MessageDoc = InferSchemaType<typeof messageSchema> & { _id: mongoose.Types.ObjectId }

export default mongoose.model<MessageDoc>('Message', messageSchema)
