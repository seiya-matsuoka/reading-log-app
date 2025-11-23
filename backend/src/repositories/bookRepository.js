import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/pool.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SQL_DIR = join(__dirname, '..', '..', 'sql', 'queries', 'books');

const q = {
  insert: readFileSync(join(SQL_DIR, 'insert_book.sql'), 'utf8'),
  list: readFileSync(join(SQL_DIR, 'list_books.sql'), 'utf8'),
  get: readFileSync(join(SQL_DIR, 'get_book.sql'), 'utf8'),
  update: readFileSync(join(SQL_DIR, 'update_book.sql'), 'utf8'),
  softDelete: readFileSync(join(SQL_DIR, 'soft_delete_book.sql'), 'utf8'),
  getCounters: readFileSync(join(SQL_DIR, 'get_book_counters.sql'), 'utf8'),
  updateCounters: readFileSync(join(SQL_DIR, 'update_book_counters.sql'), 'utf8'),
};

async function createBook({ userId, title, totalPages, author, publisher, isbn }) {
  const params = [userId, title, totalPages, author || null, publisher || null, isbn || null];
  const { rows } = await pool.query(q.insert, params);
  return rows[0];
}

async function listBooks({ userId, state, keyword }) {
  const { rows } = await pool.query(q.list, [userId, state || null, keyword || null]);
  return rows;
}

async function getBook({ id, userId }) {
  const { rows } = await pool.query(q.get, [id, userId]);
  return rows[0] || null;
}

async function updateBook({ id, userId, title, totalPages, author, publisher, isbn }) {
  // service で既に undefined が存在しない状態になっている
  const params = [id, userId, title, totalPages, author, publisher, isbn];
  const { rows } = await pool.query(q.update, params);
  return rows[0] || null;
}

async function softDeleteBook({ id, userId }) {
  const { rows } = await pool.query(q.softDelete, [id, userId]);
  return rows[0] || null;
}

async function getBookCounters({ id, userId }) {
  const { rows } = await pool.query(q.getCounters, [id, userId]);
  return rows[0] || null;
}

async function updateBookCounters({ id, userId, pagesRead, minutesTotal }) {
  const { rows } = await pool.query(q.updateCounters, [id, userId, pagesRead, minutesTotal]);
  return rows[0] || null;
}

export const bookRepository = {
  createBook,
  listBooks,
  getBook,
  updateBook,
  softDeleteBook,
  getBookCounters,
  updateBookCounters,
};
