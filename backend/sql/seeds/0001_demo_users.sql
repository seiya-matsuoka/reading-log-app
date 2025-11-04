INSERT INTO
  users (id, name, is_read_only)
VALUES
  ('demo-1', 'デモユーザ1', FALSE),
  ('demo-2', 'デモユーザ2', FALSE),
  ('demo-3', 'デモユーザ3', FALSE),
  ('demo-readonly', 'デモ閲覧用', TRUE) ON CONFLICT (id) DO NOTHING;