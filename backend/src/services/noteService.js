import { bookRepository } from '../repositories/bookRepository.js';
import { noteRepository } from '../repositories/noteRepository.js';
import { MSG } from '../utils/messages.js';

async function createNote(input) {
  const { bookId, userId, body } = input;

  // booksの存在チェック（存在しなければ404）
  const book = await bookRepository.getBook({ id: bookId, userId });
  if (!book) throw new Error(MSG.ERR_NOT_FOUND);

  const createdNote = await noteRepository.createNote({ bookId, userId, body });
  return { note: createdNote };
}

async function listNotes(input) {
  return await noteRepository.listNotes(input);
}

async function getNote(input) {
  const note = await noteRepository.getNote(input);
  if (!note) throw new Error(MSG.ERR_NOT_FOUND);
  return { note };
}

async function updateNote(input) {
  const updatedNote = await noteRepository.updateNote(input);
  if (!updatedNote) throw new Error(MSG.ERR_NOT_FOUND);
  return { note: updatedNote };
}

async function deleteNote(input) {
  const deletedNote = await noteRepository.deleteNote(input);
  if (!deletedNote) throw new Error(MSG.ERR_NOT_FOUND);
  return { note: deletedNote };
}

export const noteService = {
  createNote,
  listNotes,
  getNote,
  updateNote,
  deleteNote,
};
