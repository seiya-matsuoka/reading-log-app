INSERT INTO
  notes (book_id, user_id, body)
VALUES
  ($1, $2, $3) RETURNING id,
  book_id,
  user_id,
  body,
  created_at;