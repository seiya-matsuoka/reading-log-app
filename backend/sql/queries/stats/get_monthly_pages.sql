-- user_id($1)の指定年月($2=year, $3=month)に読んだページ総数を返す
-- booksごとに「月末までの最大累計」 - 「月初直前の最大累計」を取得して合算

WITH bounds AS (
  SELECT
    to_date(
      ($2 :: int) :: text || '-' || lpad(($3 :: int) :: text, 2, '0') || '-01',
      'YYYY-MM-DD'
    ) AS start_date,
    (
      to_date(
        ($2 :: int) :: text || '-' || lpad(($3 :: int) :: text, 2, '0') || '-01',
        'YYYY-MM-DD'
      ) + INTERVAL '1 month'
    ) :: date AS end_date
),
books AS (
  SELECT
    id
  FROM
    books
  WHERE
    user_id = $1
    AND deleted_at IS NULL
),
per_book AS (
  SELECT
    b.id AS book_id,
    COALESCE(
      (
        SELECT
          MAX(l1.cumulative_pages)
        FROM
          reading_logs l1,
          bounds bd
        WHERE
          l1.book_id = b.id
          AND l1.user_id = $1
          AND l1.date_jst < bd.start_date
      ),
      0
    ) AS before_start,
    COALESCE(
      (
        SELECT
          MAX(l2.cumulative_pages)
        FROM
          reading_logs l2,
          bounds bd
        WHERE
          l2.book_id = b.id
          AND l2.user_id = $1
          AND l2.date_jst < bd.end_date
      ),
      0
    ) AS until_end
  FROM
    books b
)
SELECT
  COALESCE(
    SUM(GREATEST(0, p.until_end - p.before_start)),
    0
  ) :: int AS total_pages
FROM
  per_book p;