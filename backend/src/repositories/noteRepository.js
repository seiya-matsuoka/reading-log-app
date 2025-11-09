import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/pool.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SQL_DIR = join(__dirname, '..', '..', 'sql', 'queries', 'notes');

const q = {
  insert: readFileSync(join(SQL_DIR, 'insert_note.sql'), 'utf8'),
  list: readFileSync(join(SQL_DIR, 'list_notes.sql'), 'utf8'),
  get: readFileSync(join(SQL_DIR, 'get_note.sql'), 'utf8'),
  update: readFileSync(join(SQL_DIR, 'update_note.sql'), 'utf8'),
  delete: readFileSync(join(SQL_DIR, 'delete_note.sql'), 'utf8'),
};

async function createNote({ bookId, userId, body }) {
  const { rows } = await pool.query(q.insert, [bookId, userId, body]);
  return rows[0] || null;
}

async function listNotes({ bookId, userId, limit = 50, offset = 0 }) {
  const { rows } = await pool.query(q.list, [bookId, userId, limit, offset]);
  return rows;
}

async function getNote({ noteId, userId }) {
  const { rows } = await pool.query(q.get, [noteId, userId]);
  return rows[0] || null;
}

async function updateNote({ noteId, userId, body }) {
  const { rows } = await pool.query(q.update, [noteId, userId, body]);
  return rows[0] || null;
}

async function deleteNote({ noteId, userId }) {
  const { rows } = await pool.query(q.delete, [noteId, userId]);
  return rows[0] || null;
}

export const noteRepository = {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
};
