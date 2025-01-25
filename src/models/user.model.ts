import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function(this: { googleId?: string }) {
      return !this.googleId;
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toClient = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export default mongoose.model<IUser>('User', userSchema); 