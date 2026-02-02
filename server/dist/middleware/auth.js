"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveSubscription = exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const requireAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer '))
            return res.status(401).json({ error: 'Missing token' });
        const token = header.slice('Bearer '.length);
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return res.status(500).json({ error: 'JWT_SECRET not set' });
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: payload.sub, role: payload.role };
        // ensure user still exists
        const exists = await User_1.default.exists({ _id: payload.sub });
        if (!exists)
            return res.status(401).json({ error: 'Invalid token' });
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: 'Forbidden' });
    next();
};
exports.requireRole = requireRole;
const requireActiveSubscription = async (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'student')
        return res.status(403).json({ error: 'Students only' });
    const student = await User_1.default.findById(req.user.id).select('subscriptionStatus subscriptionExpiryDate');
    if (!student)
        return res.status(401).json({ error: 'Unauthorized' });
    const exp = student.subscriptionExpiryDate ? new Date(student.subscriptionExpiryDate) : null;
    const active = student.subscriptionStatus !== 'free' && !!exp && exp.getTime() > Date.now();
    if (!active)
        return res.status(402).json({ error: 'Subscription required' });
    next();
};
exports.requireActiveSubscription = requireActiveSubscription;
