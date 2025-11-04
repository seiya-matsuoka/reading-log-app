import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ ok: true, user: req.demoUser || 'demo-1' });
});

export default router;
