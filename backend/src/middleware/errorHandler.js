import { http } from '../utils/http.js';
import { MSG } from '../utils/messages.js';

/**
 * 最終エラーハンドラ
 * - 例外/未捕捉エラーを 1 箇所で 4xx/5xx に正規化して返却
 */
export function errorHandler(err, req, res, next) {
  // レスポンス送信済みなら委譲
  if (res.headersSent) return next(err);

  // 400: JSON パース失敗など
  if (err?.type === 'entity.parse.failed' || err?.name === 'SyntaxError') {
    return http.bad(res, MSG.ERR_BAD_REQUEST);
  }

  // 409: Postgres の一意制約違反など
  // pg のエラーコード： 23505=unique_violation, 23503=foreign_key_violation
  if (err?.code === '23505' || err?.code === '23503') {
    return http.conflict(res, MSG.ERR_CONFLICT);
  }

  // その他は 500 に正規化
  console.error(err);

  return http.error(res, MSG.ERR_INTERNAL);
}
