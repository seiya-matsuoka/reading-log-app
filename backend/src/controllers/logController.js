import { logService } from '../services/logService.js';
import { hasLink } from '../utils/validation.js';
import { http } from '../utils/http.js';
import { MSG } from '../utils/messages.js';
import { isValidDateJstOrEmpty, isNotFutureJst, normalizeDateJstOrNull } from '../utils/date.js';

async function createLog(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const bookId = Number(req.params.id);
  if (!Number.isInteger(bookId)) return http.bad(res);

  const { cumulative_pages, minutes, date_jst, memo } = req.body || {};

  // minutes：0以上の整数
  if (minutes != null && !(Number.isInteger(Number(minutes)) && Number(minutes) >= 0)) {
    return http.bad(res, MSG.ERR_MINUTES_OUT_OF_RANGE);
  }

  // date_jst:：形式/JST未来日NG
  if (!isValidDateJstOrEmpty(date_jst)) return http.bad(res, MSG.ERR_DATE_PARSE);
  if (date_jst && !isNotFutureJst(date_jst)) return http.bad(res, MSG.ERR_DATE_FUTURE_FORBIDDEN);

  // memo：リンク禁止・最大500文字
  if (memo && (hasLink(memo) || String(memo).length > 500)) {
    return http.bad(res, MSG.ERR_LINK_FORBIDDEN);
  }

  try {
    // 正規化して Service に渡す（minutes は未指定なら 0、date_jst は null 化）
    const created = await logService.createLog({
      bookId,
      userId: req.demoUser,
      cumulativePages: Number(cumulative_pages),
      minutes: minutes == null ? 0 : Number(minutes),
      dateJst: normalizeDateJstOrNull(date_jst),
      memo: memo || null,
    });

    return http.created(res, { id: created.log.id, book: created.book }, MSG.INFO_SAVED);
  } catch (e) {
    // Service から MSG.* を Error(message) で投げられる
    const m = e?.message;
    if (
      m === MSG.ERR_NOT_FOUND || // 書籍が存在しない/権限なし
      m === MSG.ERR_LOG_DIFF_ZERO || // 差分0
      m === MSG.ERR_LOG_REVERSE || // 逆行
      m === MSG.ERR_PAGES_OUT_OF_RANGE || // 範囲外（0..total_pages）
      m === MSG.ERR_MINUTES_OUT_OF_RANGE // minutes 不正
    ) {
      // NOT_FOUND は 404、それ以外は 400
      return m === MSG.ERR_NOT_FOUND ? http.notFound(res, m) : http.bad(res, m);
    }
    // それ以外はサーバ内部エラー
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

async function listLogs(req, res) {
  const bookId = Number(req.params.id);
  if (!Number.isInteger(bookId)) return http.bad(res);

  // limit/offset は数値化する（未指定の場合はデフォルト値）
  const rows = await logService.listLogs({
    bookId,
    userId: req.demoUser,
    limit: Number(req.query.limit || 50),
    offset: Number(req.query.offset || 0),
  });
  // 取得データが空の場合は message を付与
  return http.ok(res, rows, rows.length ? undefined : MSG.INFO_NO_RESULTS);
}

async function deleteLatestLog(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const bookId = Number(req.params.id);
  if (!Number.isInteger(bookId)) return http.bad(res);

  try {
    const result = await logService.deleteLatestLog({ bookId, userId: req.demoUser });
    return http.ok(res, { id: result.log.id, book: result.book }, MSG.INFO_UNDO_DONE);
  } catch (e) {
    const m = e?.message;
    // 書籍かログが存在しない場合は 404
    if (m === MSG.ERR_NOT_FOUND) return http.notFound(res, m);
    // それ以外はサーバ内部エラー
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

export const logController = { createLog, listLogs, deleteLatestLog };
