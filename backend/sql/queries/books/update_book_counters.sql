UPDATE
  books
SET
  pages_read = $3,
  minutes_total = $4,
  state = CASE
    WHEN $3 >= total_pages THEN 'done'
    ELSE 'reading'
  END,
  updated_at = NOW()
WHERE
  id = $1
  AND user_id = $2
  AND deleted_at IS NULL RETURNING id,
  user_id,
  title,
  total_pages,
  pages_read,
  minutes_total,
  state,
  updated_at;