import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import { IUser } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';

// Extend Express Request type to include user
// declare global {
//   namespace Express {
//     interface Request {
//       user: IUser;  // IUser already includes _id from Document
//     }
//   }
// }

const userRepository = new UserRepository();

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    // Get user from token
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}; 