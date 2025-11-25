// 書籍詳細画面用のメモセクション
// - notes の取得 / 追加 / 編集 / 削除
// - validateNoteForm によるバリデーション

import { useEffect, useState, useCallback } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import FormFieldError from '../common/FormFieldError.jsx';
import { api } from '../../lib/api.js';
import { MSG } from '../../utils/messages.js';
import { formatYmd } from '../../utils/date.js';
import { validateNoteForm } from '../../utils/validation.js';
import { useToast } from '../../providers/toastContext.js';

export default function BookNotesSection({ bookId, isReadOnly }) {
  const { showToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 追加用フォーム
  const [form, setForm] = useState({ body: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // 編集用
  const [editingId, setEditingId] = useState(null);
  const [editingBody, setEditingBody] = useState('');
  const [editingError, setEditingError] = useState('');
  const [rowSaving, setRowSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const data = await api.get(`/api/books/${bookId}/notes`);
      setNotes(data || []);
    } catch (err) {
      setLoadError(err?.message || MSG.FE.ERR.NETWORK);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // メモ追加
  const handleAddNote = async (e) => {
    e.preventDefault();

    if (isReadOnly) {
      setFormError(MSG.FE.ERR.GENERAL_READONLY);
      return;
    }

    setFormError('');
    setFieldErrors({});

    const result = validateNoteForm(form);

    if (!result.ok) {
      setFieldErrors(result.errors);
      return;
    }

    setSaving(true);
    try {
      await api.post(`/api/books/${bookId}/notes`, result.values);

      const msg = api.getLastMessage();
      if (msg) {
        showToast({ type: 'success', message: msg });
      }

      setForm({ body: '' });
      await fetchNotes();
    } catch (err) {
      setFormError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  // 編集開始
  const handleStartEdit = (note) => {
    if (isReadOnly) return;
    setEditingId(note.id);
    setEditingBody(note.body ?? '');
    setEditingError('');
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingBody('');
    setEditingError('');
  };

  // 編集保存
  const handleSaveEdit = async (noteId) => {
    if (isReadOnly) return;

    setEditingError('');

    const result = validateNoteForm({ body: editingBody });

    if (!result.ok) {
      if (result.errors.body) setEditingError(result.errors);
      return;
    }

    setRowSaving(true);
    try {
      await api.patch(`/api/notes/${noteId}`, result.values);

      const msg = api.getLastMessage();
      if (msg) {
        showToast({ type: 'success', message: msg });
      }

      setEditingId(null);
      setEditingBody('');
      await fetchNotes();
    } catch (err) {
      setEditingError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setRowSaving(false);
    }
  };

  // 削除
  const handleDelete = async (noteId) => {
    if (isReadOnly) return;
    if (!window.confirm(MSG.FE.CONFIRM.DELETE_NOTE)) return;

    setRowSaving(true);
    try {
      await api.delete(`/api/notes/${noteId}`);

      const msg = api.getLastMessage();
      if (msg) {
        showToast({ type: 'success', message: msg });
      }

      await fetchNotes();
    } catch (err) {
      setLoadError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setRowSaving(false);
    }
  };

  return (
    <section className="bg-surface border-border/40 rounded-(--radius) border p-4 shadow-sm">
      <h3 className="mb-2 font-semibold">メモ</h3>

      {isReadOnly && <p className="text-muted mb-2 text-xs">{MSG.FE.ERR.GENERAL_READONLY}</p>}

      {/* 追加フォーム */}
      <form onSubmit={handleAddNote} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm">メモを追加</label>
          <Input
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            disabled={saving || isReadOnly}
          />
          {fieldErrors.body && <FormFieldError message={fieldErrors.body} />}
        </div>
        <Button type="submit" loading={saving} disabled={saving || isReadOnly}>
          追加
        </Button>
      </form>
      {formError && <p className="text-destructive mt-1 text-xs">{formError}</p>}

      {/* 一覧 */}
      <div className="mt-3">
        {loading ? (
          <p className="text-muted text-sm">{MSG.FE.UI.LOADING.DEFAULT}</p>
        ) : loadError ? (
          <p className="text-destructive text-sm">{loadError}</p>
        ) : notes.length ? (
          <ul className="border-border/40 bg-surface-1 rounded-(--radius) border text-sm">
            {notes.map((n) => {
              const isEditing = editingId === n.id; //ログが編集中かの判定に使用
              return (
                <li
                  key={n.id}
                  className="border-border/40 flex flex-col gap-1 border-b px-3 py-2 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-muted text-xs">
                        {n.created_at ? formatYmd(n.created_at) : '-'}
                      </div>
                      {isEditing ? (
                        <>
                          <Input
                            className="mt-1"
                            value={editingBody}
                            onChange={(e) => setEditingBody(e.target.value)}
                            disabled={rowSaving}
                          />
                          {editingError.body && <FormFieldError message={editingError.body} />}
                        </>
                      ) : (
                        <div className="mt-0.5 wrap-break-word">{n.body}</div>
                      )}
                    </div>

                    {!isReadOnly && (
                      <div className="flex shrink-0 gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              size="xs"
                              onClick={() => handleSaveEdit(n.id)}
                              loading={rowSaving}
                              disabled={rowSaving}
                            >
                              保存
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              disabled={rowSaving}
                            >
                              キャンセル
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => handleStartEdit(n)}
                              disabled={rowSaving}
                            >
                              編集
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              variant="destructive"
                              onClick={() => handleDelete(n.id)}
                              loading={rowSaving}
                              disabled={rowSaving}
                            >
                              削除
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted text-sm">{MSG.FE.UI.EMPTY.NOTES}</p>
        )}
      </div>
    </section>
  );
}
