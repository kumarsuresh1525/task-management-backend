import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    // @ts-ignore
    const userId = req.user!.id;
    
    const task = await taskService.createTask({
      title,
      description,
      userId,
      status: 'pending'
    });

    res.status(201).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userId = req.user!.id;
    const tasks = await taskService.getTasksByUser(userId);

    res.status(200).json({
      status: 'success',
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    // @ts-ignore
    const userId = req.user!.id;
    const updates = req.body;

    const task = await taskService.updateTask(taskId, userId, updates);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    // @ts-ignore
    const userId = req.user!.id;

    await taskService.deleteTask(taskId, userId);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    // @ts-ignore
    const userId = req.user!.id;

    const task = await taskService.updateTaskStatus(taskId, userId, status);

    res.status(200).json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tasks } = req.body; // Array of { taskId, order }
    // @ts-ignore
    const userId = req.user!.id;

    await taskService.updateTasksOrder(userId, tasks);

    res.status(200).json({
      status: 'success',
      message: 'Task order updated successfully'
    });
  } catch (error) {
    next(error);
  }
}; 