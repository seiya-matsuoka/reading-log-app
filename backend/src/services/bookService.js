import { bookRepository } from '../repositories/bookRepository.js';

async function createBook(input) {
  return await bookRepository.createBook(input);
}

async function listBooks(input) {
  return await bookRepository.listBooks(input);
}

async function getBook(input) {
  return await bookRepository.getBook(input);
}

async function updateBook(input) {
  const { id, userId, title, totalPages, author, publisher, isbn } = { ...input };

  // DBに格納されてる情報を取得
  const cur = await bookRepository.getBook({ id, userId });
  if (!cur) return null;

  // 未指定(undefined)の項目は取得した現行値を使用。"" の場合はNULLクリア。それ以外は新たな値。
  const updateInput = {
    id,
    userId,
    title: title !== undefined ? title : cur.title,
    totalPages: totalPages !== undefined ? totalPages : cur.total_pages,
    author: author !== undefined ? (author === '' ? null : author) : cur.author,
    publisher: publisher !== undefined ? (publisher === '' ? null : publisher) : cur.publisher,
    isbn: isbn !== undefined ? (isbn === '' ? null : isbn) : cur.isbn,
  };

  // 全ての値をSQLへバインドできる状態で呼び出す（undefined が存在しない状態）
  return await bookRepository.updateBook(updateInput);
}

async function softDeleteBook(input) {
  return await bookRepository.softDeleteBook(input);
}

export const bookService = {
  createBook,
  listBooks,
  getBook,
  updateBook,
  softDeleteBook,
};
