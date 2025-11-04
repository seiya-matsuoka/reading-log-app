import 'dotenv/config';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db/pool.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const MIG_DIR = join(__dirname, '..', 'sql', 'migrations');

async function main() {
  // SQL側で管理テーブル作成済みだが、念のため実行
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = readdirSync(MIG_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let applied = 0;

  for (const f of files) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename=$1', [f]);
    if (rows.length) continue;

    const sql = readFileSync(join(MIG_DIR, f), 'utf8');
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
      await pool.query('COMMIT');
      applied++;
    } catch (e) {
      await pool.query('ROLLBACK');
      throw e;
    }
  }

  await pool.end();

  return applied;
}

main()
  .then((n) => {
    console.log(`[db:migrate] OK${n ? ` (${n} file${n > 1 ? 's' : ''} applied)` : ''}`);
  })
  .catch((err) => {
    console.error(`[db:migrate] FAILED: ${err?.message || err}`);
    process.exit(1);
  });
