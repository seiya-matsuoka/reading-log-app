import { http } from '../utils/http.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// 書き込み系メソッドを ReadOnly ユーザーで 403 エラーにする
export function readonlyGuard(req, res, next) {
  if (req.isReadOnly && MUTATING.has(req.method)) {
    return http.forbidden(res);
  }
  return next();
}
