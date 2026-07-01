import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../error/appError.js';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next(new UnauthorizedError('Token requerido'));

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        next(new UnauthorizedError('Token inválido o expirado'));
    }
};
