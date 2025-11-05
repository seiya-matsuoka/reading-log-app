SELECT
  id,
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
  updated_at
FROM
  books
WHERE
  id = $1
  AND user_id = $2
  AND deleted_at IS NULL;