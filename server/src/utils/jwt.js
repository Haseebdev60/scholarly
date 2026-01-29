import jwt from 'jsonwebtoken';
export const signToken = (userId, role) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jwt.sign({ role }, secret, { subject: userId, expiresIn });
};
export const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not set');
    try {
        const decoded = jwt.verify(token, secret);
        return { id: decoded.sub, role: decoded.role };
    }
    catch (err) {
        return null;
    }
};
