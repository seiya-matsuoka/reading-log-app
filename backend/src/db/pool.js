import pg from 'pg';

const { Pool } = pg;

// Postgres の pooled 接続文字列
const connStr = process.env.DATABASE_URL_POOLED;

export const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
});
