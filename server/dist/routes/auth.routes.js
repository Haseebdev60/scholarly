"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const router = (0, express_1.Router)();
// POST /api/auth/register
// body: { name, email, password, role }  role: student|teacher|admin
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password || !role)
        return res.status(400).json({ error: 'Missing fields' });
    if (!['student', 'teacher', 'admin'].includes(role))
        return res.status(400).json({ error: 'Invalid role' });
    const existing = await User_1.default.findOne({ email });
    if (existing)
        return res.status(409).json({ error: 'Email already in use' });
    const doc = await User_1.default.create({
        name,
        email,
        password,
        role: role,
        approved: role === 'teacher' ? false : true,
        subscriptionStatus: role === 'student' ? 'free' : undefined,
    });
    const token = (0, jwt_1.signToken)(doc._id.toString(), doc.role);
    res.status(201).json({
        token,
        user: { id: doc._id, name: doc.name, email: doc.email, role: doc.role, approved: doc.approved, avatar: doc.avatar },
    });
});
// POST /api/auth/login
// body: { email, password }
router.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password)
        return res.status(400).json({ error: 'Missing fields' });
    const user = await User_1.default.findOne({ email }).select('+password');
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = (0, jwt_1.signToken)(user._id.toString(), user.role);
    res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved, avatar: user.avatar },
    });
});
// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded)
            return res.status(401).json({ error: 'Invalid token' });
        const { name, avatar } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        const user = await User_1.default.findByIdAndUpdate(decoded.id, { name, avatar }, { new: true });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved, avatar: user.avatar }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.default = router;
