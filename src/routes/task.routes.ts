import { Router } from 'express';
import { 
  createTask, 
  updateTask, 
  deleteTask, 
  getTasks,
  updateTaskStatus,
  updateTaskOrder
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected with authentication
router.use(authenticate);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.patch('/:taskId/status', updateTaskStatus);
router.patch('/reorder', updateTaskOrder);

export default router; 