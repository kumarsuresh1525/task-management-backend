import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../middleware/error.middleware';
import { IUser } from '../models/user.model';
import crypto from 'crypto';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData: { name: string; email: string; password: string }) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const user = await this.userRepository.create(userData);
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async googleAuth(profile: any) {
    const existingUser = await this.userRepository.findByGoogleId(profile.id);
    if (existingUser) {
      const token = this.generateToken(existingUser);
      return { user: existingUser, token };
    }

    // Check if user exists with same email
    const userWithEmail = await this.userRepository.findByEmail(profile.emails[0].value);
    if (userWithEmail) {
      // Link Google account to existing user
      userWithEmail.googleId = profile.id;
      await userWithEmail.save();
      const token = this.generateToken(userWithEmail);
      return { user: userWithEmail, token };
    }

    // Create new user
    const newUser = await this.userRepository.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id
    });

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token to user
    await this.userRepository.update(user._id.toString(), {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // In a real application, send email with reset token
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.userRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepository.update(user._id.toString(), {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined
    });
  }

  private generateToken(user: IUser): string {
    return jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );
  }
} 