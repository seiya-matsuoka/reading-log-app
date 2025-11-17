import { sanitizeInput, hasLink } from './sanitize.js';
import { MSG } from './messages.js';

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

// --- フォーム単位のバリデーション関数 --------------------------------

// 書籍フォームのバリデーション
export function validateBookForm(form) {
  const errors = {};

  const title = sanitizeInput(form.title);
  if (!title) {
    errors.title = MSG.FE.ERR.VALID.BOOK.TITLE_REQUIRED;
  }

  const totalPagesInt = toPositiveInt(form.totalPages);
  if (totalPagesInt == null) {
    errors.totalPages = MSG.FE.ERR.VALID.BOOK.TOTAL_PAGES_POSITIVE;
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
