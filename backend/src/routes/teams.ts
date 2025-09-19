import { Router } from 'express';
import { getTeams, createTeam } from '../controllers/teamsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getTeams);
router.post('/', createTeam);

export default router;