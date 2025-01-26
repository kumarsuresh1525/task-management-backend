import { BaseRepository } from './base.repository';
import Task, { ITask } from '../models/task.model';
import { Types } from 'mongoose';

export class TaskRepository extends BaseRepository<ITask> {
  constructor() {
    super(Task);
  }

  async findByUser(userId: Types.ObjectId): Promise<ITask[]> {
    return this.model.find({ userId }).sort({ order: 1 });
  }

  async findLastTaskByUser(userId: Types.ObjectId): Promise<ITask | null> {
    return this.model.findOne({ userId }).sort({ order: -1 });
  }
} 