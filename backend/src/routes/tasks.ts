import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  shareTask,
  unshareTask,
  getTaskStats
} from '../controllers/taskController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Task CRUD operations
router.get('/', getTasks);
router.post('/', createTask);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Task sharing
router.post('/:id/share', shareTask);
router.delete('/:id/share/:userId', unshareTask);

export default router;