// Book の新規登録／編集で共通して使うフォームコンポーネント。
// - フォーム状態の管理
// - クライアント側バリデーション(validateBookForm)の呼び出し
// - ページ側（BookNew / BookDetail）はどこに送るか（POST/PATCH）だけを意識できるように設計

import { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import FormFieldError from '../common/FormFieldError.jsx';
import { MSG } from '../../utils/messages.js';
import { validateBookForm, normalizeIsbn } from '../../utils/validation.js';

export default function BookForm({
  mode = 'create',
  initialValues,
  onSubmit,
  onCancel,
  isReadOnly = false,
}) {
  const [form, setForm] = useState({
    title: initialValues?.title ?? '',
    totalPages:
      initialValues?.totalPages != null && initialValues.totalPages !== ''
        ? String(initialValues.totalPages)
        : '',
    author: initialValues?.author ?? '',
    publisher: initialValues?.publisher ?? '',
    isbn: initialValues?.isbn ?? '',
  });

  // 項目ごとのエラー + グローバルエラー（_global）
  const [errors, setErrors] = useState({});
  // サーバーエラーや一般的なエラー
  const [submitError, setSubmitError] = useState('');
  // 送信中フラグ
  const [saving, setSaving] = useState(false);

  // 共通の onChange ハンドラ
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // 入力中項目のエラーを入力中はクリアする（blur時にバリデーション → エラー表示する）
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // blur時に単項目＋グローバルのバリデーションを行う
  const handleBlur = (field) => () => {
    // ISBN は blur のタイミングで値の正規化をする
    let nextForm = form;
    if (field === 'isbn') {
      const normalized = normalizeIsbn(form.isbn);
      nextForm = { ...form, isbn: normalized };
      setForm((prev) => ({ ...prev, isbn: normalized }));
    }

    const result = validateBookForm(nextForm);
    const fieldError = result.errors[field];
    const globalError = result.errors._global;

    setErrors((prev) => {
      const next = { ...prev, [field]: fieldError };
      // グローバルエラーは存在する場合だけセット、なければ削除
      if (globalError) {
        next._global = globalError;
      } else {
        delete next._global;
      }
      return next;
    });
  };

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitError('');

    // 読み取り専用ユーザーなら終了
    if (isReadOnly) {
      setSubmitError(MSG.FE.ERR.GENERAL_READONLY);
      return;
    }

    const result = validateBookForm(form);

    if (!result.ok) {
      // 項目ごとのエラーとグローバルエラーを反映
      setErrors(result.errors);
      return;
    }

    setSaving(true);
    try {
      // 正規化済みの値（title / total_pages / author / publisher / isbn）を親へ渡す
      await onSubmit(result.values);
    } catch (err) {
      setSubmitError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  // バリデーション結果の _global か submitError を保持する
  const globalMessage = errors._global || submitError;

  const isDisabled = saving || isReadOnly;

  const submitLabel = mode === 'edit' ? '修正する' : '登録する';
  const cancelLabel = mode === 'edit' ? '詳細へ戻る' : '一覧へ戻る';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* フォーム全体のエラー */}
      {globalMessage && (
        <div className="sm:col-span-2">
          <FormFieldError message={globalMessage} />
        </div>
      )}

      {/* 読み取り専用ユーザー向けの注意文 */}
      {isReadOnly && (
        <div className="text-muted text-xs sm:col-span-2">{MSG.FE.ERR.GENERAL_READONLY}</div>
      )}

      {/* 書籍名 */}
      <div className="sm:col-span-2">
        <label className="mb-1 block text-sm">
          書籍名 <span className="text-destructive">*</span>
        </label>
        <Input
          value={form.title}
          onChange={handleChange('title')}
          onBlur={handleBlur('title')}
          disabled={isDisabled}
          placeholder="例）リーダブルコード"
        />
        {errors.title && <FormFieldError message={errors.title} className="mt-1" />}
      </div>

      {/* 総ページ数 */}
      <div>
        <label className="mb-1 block text-sm">
          総ページ数 <span className="text-destructive">*</span>
        </label>
        <Input
          type="number"
          min="1"
          value={form.totalPages}
          onChange={handleChange('totalPages')}
          onBlur={handleBlur('totalPages')}
          disabled={isDisabled}
          placeholder="例）320"
        />
        {errors.totalPages && <FormFieldError message={errors.totalPages} className="mt-1" />}
      </div>

      {/* 著者 */}
      <div>
        <label className="mb-1 block text-sm">著者</label>
        <Input
          value={form.author}
          onChange={handleChange('author')}
          onBlur={handleBlur('author')}
          disabled={isDisabled}
          placeholder="例）山田 太郎"
        />
        {errors.author && <FormFieldError message={errors.author} className="mt-1" />}
      </div>

      {/* 出版社 */}
      <div>
        <label className="mb-1 block text-sm">出版社</label>
        <Input
          value={form.publisher}
          onChange={handleChange('publisher')}
          onBlur={handleBlur('publisher')}
          disabled={isDisabled}
          placeholder="例）技術評論社"
        />
        {errors.publisher && <FormFieldError message={errors.publisher} className="mt-1" />}
      </div>

      {/* ISBN */}
      <div>
        <label className="mb-1 block text-sm">ISBN（ハイフン不要）</label>
        <Input
          type="text"
          inputMode="numeric"
          value={form.isbn}
          onChange={handleChange('isbn')}
          onBlur={handleBlur('isbn')}
          disabled={isDisabled}
          placeholder="10桁または13桁の数字"
        />
        {errors.isbn && <FormFieldError message={errors.isbn} className="mt-1" />}
      </div>

      {/* ボタン群 */}
      <div className="flex justify-center gap-3 pt-2 sm:col-span-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="min-w-[120px]"
          disabled={saving}
        >
          {cancelLabel}
        </Button>
        <Button type="submit" loading={saving} disabled={isDisabled} className="min-w-[120px]">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
