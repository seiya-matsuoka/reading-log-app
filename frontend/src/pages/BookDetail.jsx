import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import FormFieldError from '../components/common/FormFieldError.jsx';
import QuickUpdateForm from '../components/books/QuickUpdateForm.jsx';
import BookForm from '../components/books/BookForm.jsx';
import { api } from '../lib/api.js';
import { useMe } from '../providers/meContext.jsx';
import { MSG } from '../utils/messages.js';
import { formatYmd } from '../utils/date.js';
import { validateNoteForm } from '../utils/validation.js';

export default function BookDetail() {
  const { id } = useParams();
  const { isReadOnly } = useMe();

  const [book, setBook] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isEditing, setIsEditing] = useState(false); // 書籍情報編集モード
  const [savingBook, setSavingBook] = useState(false);
  const [bookFormError, setBookFormError] = useState('');
  const [undoError, setUndoError] = useState('');

  const [noteForm, setNoteForm] = useState({ body: '' });
  const [noteFieldErrors, setNoteFieldErrors] = useState({});
  const [noteFormError, setNoteFormError] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const [b, ls, ns] = await Promise.all([
        api.get(`/api/books/${id}`),
        api.get(`/api/books/${id}/logs`),
        api.get(`/api/books/${id}/notes`),
      ]);
      setBook(b || null);
      setLogs(ls || []);
      setNotes(ns || []);
    } catch (err) {
      setLoadError(err?.message || MSG.FE.ERR.NETWORK);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ローディング
  if (loading) {
    return <p className="text-muted text-sm">{MSG.FE.UI.LOADING.DEFAULT}</p>;
  }

  // ロードエラー
  if (loadError) {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-(--radius) border p-4 text-sm">
        {loadError}
      </div>
    );
  }

  // 未取得
  if (!book) {
    return <p className="text-destructive text-sm">{MSG.FE.ERR.BOOKDETAIL}</p>;
  }

  // 進捗率
  const totalPages = Number(book.total_pages) || 0;
  const pagesRead = Number(book.pages_read) || 0;
  const progress = totalPages > 0 ? Math.min(100, Math.round((pagesRead / totalPages) * 100)) : 0;

  // 書籍情報の更新
  const handleUpdateBook = async (values) => {
    if (!book) return;
    setBookFormError('');
    setSavingBook(true);
    try {
      await api.patch(`/api/books/${book.id}`, values);
      setIsEditing(false);
      await fetchAll();
    } catch (err) {
      setBookFormError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setSavingBook(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setBookFormError('');
  };

  // 直前のログ削除
  const handleUndoLast = async () => {
    if (isReadOnly) {
      setUndoError(MSG.FE.ERR.GENERAL_READONLY);
      return;
    }

    setUndoError('');
    try {
      await api.delete(`/api/books/${book.id}/logs/last`);
      await fetchAll();
    } catch (err) {
      setUndoError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    }
  };

  // メモ追加
  const handleAddNote = async (e) => {
    e.preventDefault();

    if (isReadOnly) {
      setNoteFormError(MSG.FE.ERR.GENERAL_READONLY);
      return;
    }

    setNoteFormError('');
    setNoteFieldErrors({});

    const result = validateNoteForm(noteForm);

    if (!result.ok) {
      setNoteFieldErrors(result.errors);
      return;
    }

    setSavingNote(true);
    try {
      await api.post(`/api/books/${book.id}/notes`, result.values);
      setNoteForm({ body: '' });
      await fetchAll();
    } catch (err) {
      setNoteFormError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 書籍情報 + 編集モード切り替え */}
      <section className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
        {isEditing ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">書籍情報編集</h2>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                キャンセル
              </Button>
            </div>
            <BookForm
              mode="edit"
              initialValues={{
                title: book.title,
                totalPages: book.total_pages,
                author: book.author,
                publisher: book.publisher,
                isbn: book.isbn,
              }}
              saving={savingBook}
              isReadOnly={isReadOnly}
              onSubmit={handleUpdateBook}
              onCancel={handleCancelEdit}
              error={bookFormError}
            />
          </>
        ) : (
          <>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{book.title}</h2>
                {book.author && <p className="text-muted mt-0.5 text-sm">著者：{book.author}</p>}
                <p className="text-muted mt-1 text-xs">
                  最終更新：
                  {book.updated_at ? formatYmd(book.updated_at) : '-'}
                </p>
              </div>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  編集
                </Button>
              )}
            </div>

            {/* 進捗バー */}
            <div className="mb-4">
              <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary-500 h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-muted mt-1 text-xs">
                進捗：{pagesRead}/{totalPages} ページ（{progress}%）・累計 {book.minutes_total ?? 0}{' '}
                分
              </div>
            </div>

            {/* クイック更新フォーム */}
            <QuickUpdateForm bookId={book.id} totalPages={totalPages} onSaved={fetchAll} />

            {/* Undo ボタン */}
            <div className="mt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUndoLast}
                disabled={isReadOnly}
              >
                直前のログを削除
              </Button>
              {undoError && <p className="text-destructive mt-1 text-xs">{undoError}</p>}
            </div>
          </>
        )}
      </section>

      {/* ログ履歴 */}
      <section className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
        <h3 className="mb-2 font-semibold">ログ履歴</h3>
        {logs.length ? (
          <ul className="divide-border/30 border-border/40 bg-surface-1 divide-y rounded-(--radius) border text-sm">
            {logs.map((l) => {
              const delta =
                l.delta_pages === null || l.delta_pages === undefined
                  ? ''
                  : `（+${l.delta_pages}）`;
              return (
                <li
                  key={l.id}
                  className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium">{formatYmd(l.date_jst)}</span>
                    <span className="ml-2">
                      累計 {l.cumulative_pages} ページ{delta} ／{l.minutes ?? 0} 分
                    </span>
                  </div>
                  {l.memo && <p className="text-muted text-xs sm:text-right">{l.memo}</p>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted text-sm">{MSG.FE.UI.EMPTY.LOGS}</p>
        )}
      </section>

      {/* メモ履歴 + 追加 */}
      <section className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
        <h3 className="mb-2 font-semibold">メモ</h3>
        <form onSubmit={handleAddNote} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm">メモを追加</label>
            <Input
              value={noteForm.body}
              onChange={(e) => setNoteForm((prev) => ({ ...prev, body: e.target.value }))}
              disabled={isReadOnly}
            />
            {noteFieldErrors.body && <FormFieldError message={noteFieldErrors.body} />}
          </div>
          <Button type="submit" loading={savingNote} disabled={savingNote || isReadOnly}>
            追加
          </Button>
        </form>
        {noteFormError && <p className="text-destructive mt-1 text-xs">{noteFormError}</p>}

        {notes.length ? (
          <ul className="divide-border/30 border-border/40 bg-surface-1 mt-3 divide-y rounded-(--radius) border text-sm">
            {notes.map((n) => (
              <li key={n.id} className="px-3 py-2">
                <div className="text-muted text-xs">{formatYmd(n.created_at)}</div>
                <div className="mt-0.5">{n.body}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted mt-3 text-sm">{MSG.FE.UI.EMPTY.NOTES}</p>
        )}
      </section>
    </div>
  );
}
