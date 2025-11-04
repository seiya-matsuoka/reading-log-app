import { Router } from 'express';

const router = Router();

// デモユーザー（固定値）
const DEMO_USERS = {
  'demo-1': { id: 'demo-1', name: 'デモユーザ1', isReadOnly: false },
  'demo-2': { id: 'demo-2', name: 'デモユーザ2', isReadOnly: false },
  'demo-3': { id: 'demo-3', name: 'デモユーザ3', isReadOnly: false },
  'demo-readonly': { id: 'demo-readonly', name: 'デモ閲覧用', isReadOnly: true },
};

router.get('/', (req, res) => {
  const u = DEMO_USERS[req.demoUser] || DEMO_USERS['demo-1'];
  res.json({ data: u });
});

export default router;
