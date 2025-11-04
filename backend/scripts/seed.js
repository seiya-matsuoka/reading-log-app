import 'dotenv/config';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db/pool.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SEED_DIR = join(__dirname, '..', 'sql', 'seeds');

async function main() {
  const files = readdirSync(SEED_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let executed = 0;

  for (const f of files) {
    const sql = readFileSync(join(SEED_DIR, f), 'utf8');
    await pool.query(sql);
    executed++;
  }
  await pool.end();

  return executed;
}

main()
  .then((n) => {
    console.log(`[db:seed] OK${n ? ` (${n} file${n > 1 ? 's' : ''} executed)` : ''}`);
  })
  .catch((err) => {
    console.error(`[db:seed] FAILED: ${err?.message || err}`);
    process.exit(1);
  });
