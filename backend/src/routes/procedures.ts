import { Router } from 'express';
import { getProcedures, createProcedure, updateProcedure } from '../controllers/proceduresController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getProcedures);
router.post('/', createProcedure);
router.put('/:id', updateProcedure);

export default router;