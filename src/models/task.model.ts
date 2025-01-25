import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'done';
  userId: mongoose.Types.ObjectId;
  order: number;
}

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'done'],
    default: 'pending',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

taskSchema.methods.toClient = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  return obj;
};

export default mongoose.model<ITask>('Task', taskSchema); 