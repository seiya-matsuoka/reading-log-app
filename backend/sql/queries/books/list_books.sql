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
  user_id = $1
  AND deleted_at IS NULL
  AND (
    $2 :: text IS NULL
    OR state = $2
  )
  AND (
    $3 :: text IS NULL
    OR title ILIKE '%' || $3 || '%'
    OR author ILIKE '%' || $3 || '%'
  )
ORDER BY
  CASE
    state
    WHEN 'reading' THEN 0
    ELSE 1
  END,
  updated_at DESC;