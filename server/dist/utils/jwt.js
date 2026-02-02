"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signToken = (userId, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jsonwebtoken_1.default.sign({ role }, secret, { subject: userId, expiresIn });
};
exports.signToken = signToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return { id: decoded.sub, role: decoded.role };
    }
    catch (err) {
        return null;
    }
};
exports.verifyToken = verifyToken;
