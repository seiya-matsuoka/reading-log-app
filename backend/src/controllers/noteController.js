import { noteService } from '../services/noteService.js';
import { http } from '../utils/http.js';
import { MSG } from '../utils/messages.js';
import { hasLink } from '../utils/validation.js';

async function createNote(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const bookId = Number(req.params.bookId);
  if (!Number.isInteger(bookId)) return http.bad(res);

  const { body } = req.body || {};

  // body：文字列であること、最大500文字、リンク禁止
  if (typeof body !== 'string') return http.bad(res, MSG.ERR_BAD_REQUEST);
  if (body.length > 500) return http.bad(res, MSG.ERR_NOTE_MAXLEN);
  if (hasLink(body)) return http.bad(res, MSG.ERR_LINK_FORBIDDEN);

  try {
    const created = await noteService.createNote({
      bookId,
      userId: req.demoUser,
      body,
    });
    return http.created(res, { id: created.note.id }, MSG.INFO_SAVED);
  } catch (e) {
    const m = e?.message;
    if (m === MSG.ERR_NOT_FOUND) return http.notFound(res, m);
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

async function listNotes(req, res) {
  const bookId = Number(req.params.bookId);
  if (!Number.isInteger(bookId)) return http.bad(res);

  // limit/offset は数値化する（未指定の場合はデフォルト値）
  const rows = await noteService.listNotes({
    bookId,
    userId: req.demoUser,
    limit: Number(req.query.limit || 50),
    offset: Number(req.query.offset || 0),
  });
  // 取得データが空の場合は message を付与
  return http.ok(res, rows, rows.length ? undefined : MSG.INFO_NO_RESULTS);
}

async function getNote(req, res) {
  const noteId = Number(req.params.noteId);
  if (!Number.isInteger(noteId)) return http.bad(res);

  try {
    const row = await noteService.getNote({ noteId, userId: req.demoUser });
    return http.ok(res, row.note);
  } catch (e) {
    const m = e?.message;
    if (m === MSG.ERR_NOT_FOUND) return http.notFound(res, m);
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

async function updateNote(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const noteId = Number(req.params.noteId);
  if (!Number.isInteger(noteId)) return http.bad(res);

  const { body } = req.body || {};

  // body：存在チェック、文字列であること、最大500文字、リンク禁止
  if (body === undefined) return http.bad(res, MSG.ERR_BAD_REQUEST);
  if (typeof body !== 'string') return http.bad(res, MSG.ERR_BAD_REQUEST);
  if (body.length > 500) return http.bad(res, MSG.ERR_NOTE_MAXLEN);
  if (hasLink(body)) return http.bad(res, MSG.ERR_LINK_FORBIDDEN);

  try {
    const updated = await noteService.updateNote({
      noteId,
      userId: req.demoUser,
      body,
    });
    return http.ok(res, updated.note, MSG.INFO_SAVED);
  } catch (e) {
    const m = e?.message;
    if (m === MSG.ERR_NOT_FOUND) return http.notFound(res, m);
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

async function deleteNote(req, res) {
  if (req.isReadOnly) return http.forbidden(res);

  const noteId = Number(req.params.noteId);
  if (!Number.isInteger(noteId)) return http.bad(res);

  try {
    const result = await noteService.deleteNote({ noteId, userId: req.demoUser });
    return http.ok(res, { id: result.note.id }, MSG.INFO_DELETED);
  } catch (e) {
    const m = e?.message;
    if (m === MSG.ERR_NOT_FOUND) return http.notFound(res, m);
    return http.error(res, MSG.ERR_INTERNAL);
  }
}

export const noteController = {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
};
