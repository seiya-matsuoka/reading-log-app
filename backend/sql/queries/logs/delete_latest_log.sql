WITH latest AS (
  SELECT
    id
  FROM
    reading_logs
  WHERE
    book_id = $1
    AND user_id = $2
  ORDER BY
    created_at DESC,
    id DESC
  LIMIT
    1
)
DELETE FROM
  reading_logs r USING latest
WHERE
  r.id = latest.id RETURNING r.id,
  r.book_id,
  r.user_id,
  r.cumulative_pages,
  r.minutes,
  r.date_jst,
  r.memo,
  r.created_at;