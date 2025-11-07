import { bookService } from '../services/bookService.js';
import { hasLink, isNonEmptyText, toPositiveInt, isValidIsbnOrEmpty } from '../utils/validation.js';
import { http } from '../utils/http.js';
import { MSG } from '../utils/messages.js';

async function createBook(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const { title, total_pages, author, publisher, isbn } = req.body || {};

  if (!isNonEmptyText(title)) {
    return http.bad(res, MSG.ERR_TITLE_REQUIRED);
  }
  if (hasLink(title) || hasLink(author) || hasLink(publisher)) {
    return http.bad(res, MSG.ERR_LINK_FORBIDDEN);
  }

  const total = toPositiveInt(total_pages);
  if (total == null) return http.bad(res, MSG.ERR_TOTAL_PAGES_RANGE);

  if (!isValidIsbnOrEmpty(isbn)) return http.bad(res, MSG.ERR_ISBN_FORMAT);

  const created = await bookService.createBook({
    userId: req.demoUser,
    title: title.trim(),
    totalPages: total,
    author: author?.trim() || null,
    publisher: publisher?.trim() || null,
    isbn: isbn ? String(isbn).trim() : null,
  });

  return http.created(res, created);
}

async function listBooks(req, res) {
  const st = req.query.state === 'reading' || req.query.state === 'done' ? req.query.state : null;
  const rows = await bookService.listBooks({ userId: req.demoUser, state: st });
  // 取得データが空の場合は message を付与
  return http.ok(res, rows, rows.length ? undefined : MSG.INFO_NO_RESULTS);
}

async function getBook(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return http.bad(res);

  const row = await bookService.getBook({ id, userId: req.demoUser });
  if (!row) return http.notFound(res);

  return http.ok(res, row);
}

async function updateBook(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return http.bad(res);

  const { title, total_pages, author, publisher, isbn } = req.body || {};

  // title：undefined or nullの場合はスキップ
  if (title != null) {
    if (!isNonEmptyText(title)) return http.bad(res, MSG.ERR_TITLE_REQUIRED);
    if (hasLink(title)) return http.bad(res, MSG.ERR_LINK_FORBIDDEN);
  }

  // author / publisher：falsyの場合はスキップ(空文字でクリアしたい場合もエラーにならない)
  if (author && hasLink(author)) return http.bad(res, MSG.ERR_LINK_FORBIDDEN);
  if (publisher && hasLink(publisher)) return http.bad(res, MSG.ERR_LINK_FORBIDDEN);

  // total_pages：undefined or nullの場合はスキップ
  let total = null;
  if (total_pages != null) {
    total = toPositiveInt(total_pages);
    if (total == null) return http.bad(res, MSG.ERR_TOTAL_PAGES_RANGE);
  }

  // isbn：undefined or nullの場合はスキップ
  if (isbn != null && !isValidIsbnOrEmpty(isbn)) return http.bad(res, MSG.ERR_ISBN_FORMAT);

  // 未指定の項目は undefined に正規化して Service に渡す
  const updated = await bookService.updateBook({
    id,
    userId: req.demoUser,
    title: title?.trim(),
    totalPages: total ?? undefined,
    author: author?.trim(),
    publisher: publisher?.trim(),
    isbn: isbn == null ? undefined : String(isbn).trim(),
  });

  if (!updated) return http.notFound(res);

  return http.ok(res, updated, MSG.INFO_SAVED);
}

async function softDeleteBook(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return http.bad(res);

  const row = await bookService.softDeleteBook({ id, userId: req.demoUser });
  if (!row) return http.notFound(res);

  return http.ok(res, { id: row.id }, MSG.INFO_DELETED);
}

export const bookController = {
  createBook,
  listBooks,
  getBook,
  updateBook,
  softDeleteBook,
};
