import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await authService.register({ name, email, password });

    res.status(201).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      status: 'success',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.forgotPassword(email);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email',
      data: { resetToken } // In production, don't send this token in response
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password successfully reset'
    });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.googleAuth(req.user);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/google?token=${token}`);
  } catch (error) {
    next(error);
  }
}; 