"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['student', 'teacher', 'admin'] },
    // Student
    subscriptionStatus: {
        type: String,
        enum: ['free', 'weekly', 'monthly'],
        default: 'free',
    },
    subscriptionExpiryDate: { type: Date, default: null },
    enrolledSubjects: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', default: [] }],
    // Teacher
    approved: { type: Boolean, default: false },
    assignedSubjects: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', default: [] }],
    bio: { type: String },
    avatar: { type: String },
    hourlyRate: { type: Number, default: 2000 },
    availability: [{
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            slots: [{
                    startTime: String, // HH:mm
                    endTime: String, // HH:mm
                    duration: Number // minutes (redundant if inferred, but good for explicit slots)
                }]
        }],
}, { timestamps: true });
userSchema.pre('save', async function passwordHash(next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcryptjs_1.default.genSalt(10);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function comparePassword(candidate) {
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.default = mongoose_1.default.model('User', userSchema);
