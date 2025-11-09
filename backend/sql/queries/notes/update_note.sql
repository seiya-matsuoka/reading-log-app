UPDATE
  notes
SET
  body = $3
WHERE
  id = $1
  AND user_id = $2 RETURNING id,
  book_id,
  user_id,
  body,
  created_at;