import { Router } from 'express';
import { statsController } from '../controllers/statsController.js';

const router = Router();

router.get('/stats/monthly', statsController.getMonthlyPages);

export default router;
