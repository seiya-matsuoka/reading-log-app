-- users（固定IDのため text 主キー）
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- books
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  total_pages INTEGER NOT NULL CHECK (total_pages >= 1),
  author TEXT,
  publisher TEXT,
  isbn TEXT,
  pages_read INTEGER NOT NULL DEFAULT 0,
  minutes_total INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'reading' CHECK (state IN ('reading', 'done')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reading_logs
CREATE TABLE IF NOT EXISTS reading_logs (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  date_jst DATE NOT NULL,
  cumulative_pages INTEGER NOT NULL CHECK (cumulative_pages >= 0),
  minutes INTEGER NOT NULL DEFAULT 0 CHECK (minutes >= 0),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notes
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  book_id BIGINT NOT NULL REFERENCES books(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_books_user_state ON books(user_id, state);

CREATE INDEX IF NOT EXISTS idx_books_title_lower ON books((LOWER(title)));

CREATE INDEX IF NOT EXISTS idx_books_author_lower ON books((LOWER(author)));

-- マイグレーション管理テーブル
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);