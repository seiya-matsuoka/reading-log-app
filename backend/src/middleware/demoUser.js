// ログイン機能なし。初期は demo-1 固定、ヘッダがあればそれを採用

const ALLOWED = ['demo-1', 'demo-2', 'demo-3', 'demo-readonly'];

export default function demoUser(req, _res, next) {
  const header = req.get('X-Demo-User');
  req.demoUser = ALLOWED.includes(header) ? header : 'demo-1';
  next();
}
