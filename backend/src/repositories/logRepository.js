import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/pool.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SQL_DIR = join(__dirname, '..', '..', 'sql', 'queries', 'logs');

const q = {
  insert: readFileSync(join(SQL_DIR, 'insert_log.sql'), 'utf8'),
  list: readFileSync(join(SQL_DIR, 'list_logs.sql'), 'utf8'),
  getlatest: readFileSync(join(SQL_DIR, 'get_latest_log.sql'), 'utf8'),
  deleteLatest: readFileSync(join(SQL_DIR, 'delete_latest_log.sql'), 'utf8'),
};

async function createLog({ bookId, userId, cumulativePages, minutes, dateJst, memo }) {
  const params = [bookId, userId, cumulativePages, minutes ?? 0, dateJst ?? null, memo ?? null];
  const { rows } = await pool.query(q.insert, params);
  return rows[0] || null;
}

async function listLogs({ bookId, userId, limit = 50, offset = 0 }) {
  const { rows } = await pool.query(q.list, [bookId, userId, limit, offset]);
  return rows;
}

async function getLatestLog({ bookId, userId }) {
  const { rows } = await pool.query(q.getlatest, [bookId, userId]);
  return rows[0] || null;
}

async function deleteLatestLog({ bookId, userId }) {
  const { rows } = await pool.query(q.deleteLatest, [bookId, userId]);
  return rows[0] || null;
}

export const logRepository = {
  createLog,
  listLogs,
  getLatestLog,
  deleteLatestLog,
};
