import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const resourceSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String },
        type: { type: String, enum: ['pdf', 'video', 'link', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'], default: 'link' },
        url: { type: String, required: true },
        // Make teacherId/subjectId optional for Admin uploads
        teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
        // New fields
        uploadedBy: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
        fileType: { type: String }, // e.g. 'application/pdf'
        isPremium: { type: Boolean, default: false },
        thumbnail: { type: String },

        year: { type: String },
        size: { type: String },
        format: { type: String },
    },
    { timestamps: true },
)

export type ResourceDoc = InferSchemaType<typeof resourceSchema> & { _id: mongoose.Types.ObjectId }

export default mongoose.model<ResourceDoc>('Resource', resourceSchema)
