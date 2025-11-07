UPDATE
  books
SET
  deleted_at = NOW(),
  updated_at = NOW()
WHERE
  id = $1
  AND user_id = $2
  AND deleted_at IS NULL RETURNING id;