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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const resourceSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['pdf', 'video', 'link', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'], default: 'link' },
    url: { type: String, required: true },
    // Make teacherId/subjectId optional for Admin uploads
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    subjectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject' },
    // New fields
    uploadedBy: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
    fileType: { type: String }, // e.g. 'application/pdf'
    isPremium: { type: Boolean, default: false },
    thumbnail: { type: String },
    year: { type: String },
    size: { type: String },
    format: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Resource', resourceSchema);
