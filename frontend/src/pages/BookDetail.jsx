import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import QuickUpdateForm from '../components/books/QuickUpdateForm.jsx';
import BookForm from '../components/books/BookForm.jsx';
import BookNotesSection from '../components/books/BookNotesSection.jsx';
import { api } from '../lib/api.js';
import { useMe } from '../providers/meContext.jsx';
import { MSG } from '../utils/messages.js';
import { formatYmd } from '../utils/date.js';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadOnly } = useMe();

  const [book, setBook] = useState(null);
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const [b, ls] = await Promise.all([
        api.get(`/api/books/${id}`),
        api.get(`/api/books/${id}/logs`),
      ]);

      setBook(b);
      setLogs(ls || []);
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

  // 書籍情報の更新（BookFormに渡す）
  const handleUpdateBook = async (values) => {
    await api.patch(`/api/books/${book.id}`, values);
    setIsEditing(false);
    await fetchAll();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // 書籍のソフト削除
  const handleDeleteBook = async () => {
    setDeleteError('');

    if (isReadOnly) {
      setDeleteError(MSG.FE.ERR.GENERAL_READONLY);
      return;
    }

    if (!window.confirm(MSG.FE.CONFIRM.DELETE_BOOK)) return;

    setDeleting(true);
    try {
      await api.delete(`/api/books/${book.id}`);
      navigate('/books', { replace: true });
    } catch (err) {
      setDeleteError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setDeleting(false);
    }
  };

  // 直前のログ削除
  const handleUndoLast = async () => {
    setUndoError('');

    if (isReadOnly) {
      setUndoError(MSG.FE.ERR.GENERAL_READONLY);
      return;
    }

    if (!window.confirm(MSG.FE.CONFIRM.UNDO_LOG)) return;

    setUndoing(true);
    try {
      await api.delete(`/api/books/${book.id}/logs/last`);
      await fetchAll();
    } catch (err) {
      setUndoError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setUndoing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 上段：左=書籍情報 / 右=進捗入力 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 書籍情報カード（閲覧 / 編集切替） */}
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
                isReadOnly={isReadOnly}
                onSubmit={handleUpdateBook}
                onCancel={handleCancelEdit}
              />
            </>
          ) : (
            <>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-3">
                  <h1 className="truncate text-lg font-semibold">{book.title}</h1>
                  {book.author && <p className="text-muted text-sm">著者：{book.author}</p>}
                  {book.publisher && <p className="text-muted text-sm">出版社：{book.publisher}</p>}
                  {book.isbn && <p className="text-muted text-sm">ISBN：{book.isbn}</p>}
                  <p className="text-muted text-xs">
                    最終更新：
                    {book.updated_at ? formatYmd(book.updated_at) : '-'}
                  </p>
                </div>

                {!isReadOnly && (
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      編集
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteBook}
                      loading={deleting}
                      disabled={deleting}
                    >
                      書籍を削除
                    </Button>
                  </div>
                )}
              </div>

              {/* 進捗バー */}
              <div>
                <div className="bg-surface-2 h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary-500 h-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-muted mt-1 text-xs">
                  進捗：{pagesRead}/{totalPages} ページ（{progress}%）・累計{' '}
                  {book.minutes_total ?? 0} 分
                </div>
              </div>

              {isReadOnly && (
                <p className="text-muted mt-3 text-xs">{MSG.FE.ERR.GENERAL_READONLY}</p>
              )}

              {deleteError && <p className="text-destructive mt-2 text-xs">{deleteError}</p>}
            </>
          )}
        </section>

        {/* 進捗入力カード（QuickUpdateForm） */}
        <section className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
          <h2 className="mb-2 text-base font-semibold">進捗を記録</h2>
          <QuickUpdateForm bookId={book.id} totalPages={totalPages} onSaved={fetchAll} />
        </section>
      </div>

      {/* 下段：左=メモ / 右=ログ履歴 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* メモカード（BookNotesSection） */}
        <BookNotesSection bookId={book.id} isReadOnly={isReadOnly} />

        {/* ログ履歴カード */}
        <section className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-semibold">ログ履歴</h3>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleUndoLast}
              loading={undoing}
              disabled={isReadOnly || undoing}
            >
              直前のログを削除
            </Button>
          </div>
          {undoError && <p className="text-destructive mb-2 text-xs">{undoError}</p>}

          {logs.length ? (
            <ul className="divide-border/30 border-border/40 bg-surface-1 divide-y rounded-(--radius) border text-sm">
              {logs.map((l) => {
                const delta =
                  l.delta_pages === null || l.delta_pages === undefined
                    ? ''
                    : `（+${l.delta_pages}）`;
                return (
                  <li key={l.id} className="flex flex-col gap-0.5 px-3 py-2">
                    <div>
                      <span className="font-medium">{formatYmd(l.date_jst)}</span>
                      <span className="ml-2">
                        累計 {l.cumulative_pages} ページ{delta} ／{l.minutes ?? 0} 分
                      </span>
                    </div>
                    {l.memo && <p className="text-muted text-xs">{l.memo}</p>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted text-sm">{MSG.FE.UI.EMPTY.LOGS}</p>
          )}
        </section>
      </div>
    </div>
  );
}
