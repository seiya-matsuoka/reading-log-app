SELECT
  id,
  book_id,
  user_id,
  body,
  created_at
FROM
  notes
WHERE
  book_id = $1
  AND user_id = $2
ORDER BY
  created_at DESC,
  id DESC
LIMIT
  $3 OFFSET $4;