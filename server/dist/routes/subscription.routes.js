"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Subject_1 = __importDefault(require("../models/Subject"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/subscriptions/buy-subscription
// Dummy payment confirmation, no gateway.
// body: { plan: weekly|monthly }
router.post('/buy-subscription', auth_1.requireAuth, (0, auth_1.requireRole)('student'), async (req, res) => {
    const { plan } = req.body ?? {};
    if (!['weekly', 'monthly'].includes(plan))
        return res.status(400).json({ error: 'Invalid plan' });
    const days = plan === 'weekly' ? 7 : 30;
    const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    // Fetch all available subjects to auto-enroll
    const subjects = await Subject_1.default.find().select('_id');
    const subjectIds = subjects.map(s => s._id);
    const updated = await User_1.default.findByIdAndUpdate(req.user.id, {
        subscriptionStatus: plan,
        subscriptionExpiryDate: expiry,
        enrolledSubjects: subjectIds
    }, { new: true }).select('subscriptionStatus subscriptionExpiryDate');
    res.json({
        message: 'Subscription activated (dummy payment)',
        subscriptionStatus: updated?.subscriptionStatus,
        subscriptionExpiryDate: updated?.subscriptionExpiryDate,
        pricePKR: plan === 'weekly' ? 300 : 1000,
    });
});
// GET /api/subscriptions/check-status
router.get('/check-status', auth_1.requireAuth, (0, auth_1.requireRole)('student'), async (req, res) => {
    const student = await User_1.default.findById(req.user.id).select('subscriptionStatus subscriptionExpiryDate');
    if (!student)
        return res.status(404).json({ error: 'Student not found' });
    const exp = student.subscriptionExpiryDate ? new Date(student.subscriptionExpiryDate) : null;
    const active = student.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now();
    res.json({
        subscriptionStatus: student.subscriptionStatus,
        subscriptionExpiryDate: student.subscriptionExpiryDate,
        isActive: active,
    });
});
exports.default = router;
