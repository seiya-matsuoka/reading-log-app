import { sanitizeInput, hasLink } from './sanitize.js';
import { MSG } from './messages.js';
import { jstToday } from './date.js';

// --- 低レベルでのバリデーション関数 ---------------------------------

// 正の整数（1以上）ならその数値、それ以外は null を返す
export function toPositiveInt(value) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

// ISBN入力値をサニタイズして、数字だけの文字列に正規化する（全角→半角、数字以外は除去）
export function normalizeIsbn(value) {
  const v = sanitizeInput(value);
  if (!v) return '';
  return v.replace(/[^0-9]/g, '');
}

// 10桁 or 13桁 のみ許可（空文字は許容）
export function isValidIsbnOrEmpty(value) {
  const digits = normalizeIsbn(value);
  if (!digits) return true;
  return digits.length === 10 || digits.length === 13;
}

// 整数でなければ NaN を返す
function toSafeInt(value) {
  if (value === '' || value == null) return NaN;
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

// --- フォーム単位のバリデーション関数 --------------------------------

// 書籍フォームのバリデーション
export function validateBookForm(form) {
  const errors = {};

  const title = sanitizeInput(form.title);
  if (!title) {
    errors.title = MSG.FE.ERR.VALID.BOOK.TITLE_REQUIRED;
  }

  let totalPagesInt = null;
  // まず空かどうかをチェック（必須エラー）
  if (form.totalPages === '' || form.totalPages == null) {
    errors.totalPages = MSG.FE.ERR.VALID.BOOK.TOTAL_PAGES_REQUIRED;
  } else {
    totalPagesInt = toPositiveInt(form.totalPages);
    if (totalPagesInt == null) {
      // 値はあるが 1 未満 or 整数でない
      errors.totalPages = MSG.FE.ERR.VALID.BOOK.TOTAL_PAGES_POSITIVE;
    }
  }

  const author = sanitizeInput(form.author);
  const publisher = sanitizeInput(form.publisher);

  // リンク禁止の対象：title / author / publisher
  if (hasLink(title) || hasLink(author) || hasLink(publisher)) {
    errors._global = MSG.FE.ERR.VALID.LINK_NOT_ALLOWED;
  }

  const isbnRaw = form.isbn ?? '';
  const isbnDigits = normalizeIsbn(isbnRaw);

  if (isbnRaw && !isValidIsbnOrEmpty(isbnRaw)) {
    errors.isbn = MSG.FE.ERR.VALID.BOOK.ISBN_FORMAT_10_13;
  }

  const ok = Object.keys(errors).length === 0;

  return {
    ok,
    errors,
    values: {
      title,
      total_pages: totalPagesInt ?? null,
      author: author || null,
      publisher: publisher || null,
      isbn: isbnDigits || null,
    },
  };
}

// 読書ログフォームのバリデーション
export function validateLogForm(form, options = {}) {
  const errors = {};

  const totalPages = typeof options.totalPages === 'number' ? options.totalPages : undefined;

  const cumulativeRaw = form.cumulativePages;
  const minutesRaw = form.minutes;
  const dateRaw = form.dateJst;
  const memoRaw = form.memo;

  const memo = sanitizeInput(memoRaw ?? '');

  const cumulative = toSafeInt(cumulativeRaw);
  const minutes = minutesRaw === '' || minutesRaw == null ? 0 : toSafeInt(minutesRaw);
  const dateJst = (dateRaw ?? '').trim();

  // 累計ページ: 必須／整数／0以上／総ページ数以下
  if (!Number.isInteger(cumulative)) {
    errors.cumulativePages = MSG.FE.ERR.VALID.LOG.CUMULATIVE_PAGES_INTEGER;
  } else if (cumulative < 0) {
    errors.cumulativePages = MSG.FE.ERR.VALID.LOG.CUMULATIVE_PAGES_NONNEGATIVE;
  } else if (typeof totalPages === 'number' && cumulative > totalPages) {
    errors.cumulativePages = MSG.FE.ERR.VALID.LOG.CUMULATIVE_PAGES_NOT_EXCEED_TOTAL;
  }

  // 読書時間（分）: 0 以上の整数
  if (!Number.isInteger(minutes)) {
    errors.minutes = MSG.FE.ERR.VALID.LOG.MINUTES_INTEGER;
  } else if (minutes < 0) {
    errors.minutes = MSG.FE.ERR.VALID.LOG.MINUTES_NONNEGATIVE;
  }

  // 日付: YYYY-MM-DD 形式／未来日禁止
  if (!dateJst || !/^\d{4}-\d{2}-\d{2}$/.test(dateJst)) {
    errors.dateJst = MSG.FE.ERR.VALID.LOG.DATE_FORMAT;
  } else {
    const today = jstToday(); // 'YYYY-MM-DD'
    if (dateJst > today) {
      errors.dateJst = MSG.FE.ERR.VALID.LOG.DATE_FUTURE_FORBIDDEN;
    }
  }

  // メモ: 500文字以内／リンク禁止
  if (memo.length > 500) {
    errors.memo = MSG.FE.ERR.VALID.LOG.MEMO_MAXLEN_500;
  } else if (memo && hasLink(memo)) {
    errors.memo = MSG.FE.ERR.VALID.LINK_NOT_ALLOWED;
  }

  const ok = Object.keys(errors).length === 0;

  return {
    ok,
    errors,
    values: {
      cumulative_pages: cumulative,
      minutes,
      date_jst: dateJst,
      memo: memo || null,
    },
  };
}
