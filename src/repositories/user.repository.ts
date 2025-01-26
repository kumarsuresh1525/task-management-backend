import { BaseRepository } from './base.repository';
import User, { IUser } from '../models/user.model';
import { Types } from 'mongoose';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email });
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return this.model.findOne({ googleId });
  }

  async updatePassword(userId: Types.ObjectId, hashedPassword: string): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );
  }
} 