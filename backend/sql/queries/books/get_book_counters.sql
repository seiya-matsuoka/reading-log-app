SELECT
  id,
  user_id,
  title,
  total_pages,
  pages_read,
  minutes_total,
  state
FROM
  books
WHERE
  id = $1
  AND user_id = $2
  AND deleted_at IS NULL;