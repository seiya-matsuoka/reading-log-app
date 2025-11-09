import { Router } from 'express';
import { noteController } from '../controllers/noteController.js';

const router = Router();

// booksスコープ（一覧取得/作成）
router.get('/books/:bookId/notes', noteController.listNotes);
router.post('/books/:bookId/notes', noteController.createNote);

// notesスコープ（参照/更新/削除）
router.get('/notes/:noteId', noteController.getNote);
router.patch('/notes/:noteId', noteController.updateNote);
router.delete('/notes/:noteId', noteController.deleteNote);

export default router;
