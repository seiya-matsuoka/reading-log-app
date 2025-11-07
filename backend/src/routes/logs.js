import { Router } from 'express';
import { logController } from '../controllers/logController.js';

const router = Router();

router.get('/:id/logs', logController.listLogs);

router.post('/:id/logs', logController.createLog);

router.delete('/:id/logs/last', logController.deleteLatestLog);

export default router;
