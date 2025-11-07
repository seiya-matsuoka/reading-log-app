UPDATE
  books
SET
  title = $3,
  total_pages = $4,
  author = $5,
  publisher = $6,
  isbn = $7,
  updated_at = NOW(),
  state = CASE
    WHEN pages_read >= $4 THEN 'done'
    ELSE 'reading'
  END
WHERE
  id = $1
  AND user_id = $2
  AND deleted_at IS NULL RETURNING id,
  user_id,
  title,
  total_pages,
  author,
  publisher,
  isbn,
  pages_read,
  minutes_total,
  state,
  created_at,
  updated_at;