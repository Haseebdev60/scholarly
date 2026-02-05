import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Try to find .env file
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') })
dotenv.config() // Also try root

const createAdmin = async () => {
    const uri = process.env.MONGO_URI
    if (!uri) {
        console.error('ERROR: MONGO_URI not found. Please ensure you have a .env file with MONGO_URI set.')
        process.exit(1)
    }

    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(uri)
        console.log('Connected.')

        const email = 'admin@scholarly.com'
        const password = 'secret'
        const hashedPassword = await bcrypt.hash(password, 10)

        // Define minimalistic User Schema to avoid importing the whole model file which might have dependency issues in script
        const User = mongoose.model('User', new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            role: { type: String, required: true },
            approved: { type: Boolean, default: false },
            subscriptionStatus: String,
            subscriptionExpiryDate: Date,
            enrolledSubjects: Array,
            assignedSubjects: Array,
            bio: String,
            avatar: String,
            hourlyRate: Number,
            availability: Array
        }, { versionKey: false }))

        // Remove existing admin if any
        await User.deleteOne({ email })

        // Create new
        await User.create({
            name: 'Scholarly Admin',
            email,
            password: hashedPassword,
            role: 'admin',
            approved: true
        })

        console.log('-----------------------------------')
        console.log('✅ Admin Account Created Successfully')
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)
        console.log('-----------------------------------')

    } catch (error) {
        console.error('Failed to create admin:', error)
    } finally {
        await mongoose.disconnect()
    }
}

createAdmin()
