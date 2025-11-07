INSERT INTO
  reading_logs (
    book_id,
    user_id,
    cumulative_pages,
    minutes,
    date_jst,
    memo
  )
VALUES
  (
    $1,
    $2,
    $3,
    COALESCE($4, 0),
    COALESCE(
      $5 :: date,
      (NOW() AT TIME ZONE 'Asia/Tokyo') :: date
    ),
    $6
  ) RETURNING id,
  book_id,
  user_id,
  cumulative_pages,
  minutes,
  date_jst,
  memo,
  created_at;