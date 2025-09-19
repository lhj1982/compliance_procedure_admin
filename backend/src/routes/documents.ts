import { Router } from 'express';
import { getDocument, getDocumentInfo } from '../controllers/documentsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Test route without auth for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Documents endpoint is working' });
});

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/:teamId/info', getDocumentInfo);
router.get('/:teamId/download', getDocument);

export default router;