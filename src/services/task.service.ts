import { TaskRepository } from '../repositories/task.repository';
import { AppError } from '../middleware/error.middleware';
import { Types } from 'mongoose';
import { ITask } from '../models/task.model';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  async createTask(taskData: {
    title: string;
    description: string;
    userId: Types.ObjectId;
    status: 'pending' | 'completed' | 'done';
  }) {
    const lastTask = await this.taskRepository.findLastTaskByUser(taskData.userId);
    const order = lastTask ? lastTask.order + 1 : 0;

    return this.taskRepository.create({ ...taskData, order });
  }

  async getTasksByUser(userId: Types.ObjectId) {
    return this.taskRepository.findByUser(userId);
  }

  async updateTask(taskId: string, userId: Types.ObjectId, updates: Partial<ITask>) {
    const task = await this.taskRepository.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (!task.userId.equals(userId)) {
      throw new AppError('Not authorized to update this task', 403);
    }

    // Prevent updating userId or order through this method
    const safeUpdates = {
      title: updates.title,
      description: updates.description,
      status: updates.status
    };

    return this.taskRepository.update(taskId, safeUpdates);
  }

  async deleteTask(taskId: string, userId: Types.ObjectId) {
    const task = await this.taskRepository.findById(taskId);
    
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (!task.userId.equals(userId)) {
      throw new AppError('Not authorized to delete this task', 403);
    }

    await this.taskRepository.delete(taskId);
  }

  async updateTaskStatus(taskId: string, userId: Types.ObjectId, status: string) {
    if (!['pending', 'completed', 'done'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    return this.updateTask(taskId, userId, { status: "completed" });
  }

  async updateTasksOrder(userId: Types.ObjectId, tasks: { taskId: string; order: number }[]) {
    // Verify all tasks belong to user
    for (const task of tasks) {
      const existingTask = await this.taskRepository.findById(task.taskId);
      if (!existingTask || !existingTask.userId.equals(userId)) {
        throw new AppError('Invalid task or unauthorized', 403);
      }
    }

    const updates = tasks.map(({ taskId, order }) => 
      this.taskRepository.update(taskId, { order })
    );

    await Promise.all(updates);
  }
} 