SELECT
  id,
  book_id,
  user_id,
  cumulative_pages,
  minutes,
  date_jst,
  memo,
  created_at
FROM
  reading_logs
WHERE
  book_id = $1
  AND user_id = $2
ORDER BY
  created_at DESC,
  id DESC
LIMIT
  $3 OFFSET $4;