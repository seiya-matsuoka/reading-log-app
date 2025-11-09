SELECT
  id,
  book_id,
  user_id,
  body,
  created_at
FROM
  notes
WHERE
  id = $1
  AND user_id = $2;