import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  joinTeamByInvite,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  leaveTeam
} from '../controllers/teamController.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Team CRUD operations
router.get('/', getTeams);
router.post('/', createTeam);
router.post('/join', joinTeamByInvite);
router.get('/:id', getTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team member management
router.post('/:id/members', addTeamMember);
router.put('/:id/members/:memberId', updateTeamMember);
router.delete('/:id/members/:memberId', removeTeamMember);
router.post('/:id/leave', leaveTeam);

export default router;