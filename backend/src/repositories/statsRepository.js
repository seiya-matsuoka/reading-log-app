import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db/pool.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SQL_DIR = join(__dirname, '..', '..', 'sql', 'queries', 'stats');

const q = {
  getMonthlyPages: readFileSync(join(SQL_DIR, 'get_monthly_pages.sql'), 'utf8'),
};

async function getMonthlyPages({ userId, year, month }) {
  const { rows } = await pool.query(q.getMonthlyPages, [userId, year, month]);
  // 数値にキャストして返却
  return { totalPages: Number(rows[0]?.total_pages ?? 0) };
}

export const statsRepository = { getMonthlyPages };
