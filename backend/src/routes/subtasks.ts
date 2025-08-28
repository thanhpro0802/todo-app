import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createSubtask,
  updateSubtask,
  deleteSubtask,
  reorderSubtasks
} from '../controllers/subtaskController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Subtask operations (nested under tasks)
router.post('/:taskId/subtasks', createSubtask);
router.put('/:taskId/subtasks/:id', updateSubtask);
router.delete('/:taskId/subtasks/:id', deleteSubtask);
router.post('/:taskId/subtasks/reorder', reorderSubtasks);

export default router;