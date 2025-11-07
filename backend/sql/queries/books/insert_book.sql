INSERT INTO
  books (
    user_id,
    title,
    total_pages,
    author,
    publisher,
    isbn
  )
VALUES
  ($1, $2, $3, $4, $5, $6) RETURNING id,
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
  updated_at;