import { bookRepository } from '../repositories/bookRepository.js';
import { logRepository } from '../repositories/logRepository.js';
import { MSG } from '../utils/messages.js';

async function createLog(input) {
  const { bookId, userId, cumulativePages, minutes = 0, dateJst = null, memo = null } = input;

  // 現在の書籍状態を取得
  const book = await bookRepository.getBookCounters({ id: bookId, userId });
  if (!book) throw new Error(MSG.ERR_NOT_FOUND);

  // 増加分 & 範囲チェック
  const prev = Number(book.pages_read) || 0;
  const total = Number(book.total_pages);
  const delta = Number(cumulativePages) - prev;

  // cumulativePages:：整数 & 0からtotalの範囲内
  if (
    !Number.isInteger(Number(cumulativePages)) ||
    cumulativePages < 0 ||
    cumulativePages > total
  ) {
    throw new Error(MSG.ERR_PAGES_OUT_OF_RANGE);
  }

  // minutes：整数 & 0以上
  if (!Number.isInteger(Number(minutes)) || minutes < 0) {
    throw new Error(MSG.ERR_MINUTES_OUT_OF_RANGE);
  }

  // ページ数増加分のチェック
  if (delta === 0) throw new Error(MSG.ERR_LOG_DIFF_ZERO);
  if (delta < 0) throw new Error(MSG.ERR_LOG_REVERSE);

  const createdLog = await logRepository.createLog({
    bookId,
    userId,
    cumulativePages,
    minutes,
    dateJst,
    memo,
  });

  // logs追加に伴うbooksの情報を更新
  const updatedBook = await bookRepository.updateBookCounters({
    id: bookId,
    userId,
    pagesRead: Number(cumulativePages),
    minutesTotal: (Number(book.minutes_total) || 0) + (Number(createdLog.minutes) || 0),
  });

  return { log: createdLog, book: updatedBook, deltaPages: delta };
}

async function listLogs(input) {
  return await logRepository.listLogs(input);
}

async function deleteLatestLog(input) {
  const { bookId, userId } = input;

  // 現在の書籍状態を取得
  const book = await bookRepository.getBookCounters({ id: bookId, userId });
  if (!book) throw new Error(MSG.ERR_NOT_FOUND);

  // 直近1件を削除（存在しなければ 404エラー）
  const deletedLog = await logRepository.deleteLatestLog({ bookId, userId });
  if (!deletedLog) throw new Error(MSG.ERR_NOT_FOUND);

  // newPagesRead：残存する最新ログから取得して pages_read の更新に使用する
  const latestLog = await logRepository.getLatestLog({ bookId, userId });
  const newPagesRead = latestLog ? Number(latestLog.cumulative_pages) : 0;

  // newMinutesTotal：削除分の minutes を引いた値を pages_read の更新に使用する
  const newMinutesTotal = Math.max(
    0,
    (Number(book.minutes_total) || 0) - (Number(deletedLog.minutes) || 0)
  );

  // logs削除に伴うbooksの情報を更新
  const updatedBook = await bookRepository.updateBookCounters({
    id: bookId,
    userId,
    pagesRead: newPagesRead,
    minutesTotal: newMinutesTotal,
  });

  return { deletedLog, book: updatedBook };
}

export const logService = { createLog, listLogs, deleteLatestLog };
