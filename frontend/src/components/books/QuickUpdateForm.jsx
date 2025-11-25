import { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import FormFieldError from '../common/FormFieldError.jsx';
import { api } from '../../lib/api.js';
import { jstToday } from '../../utils/date.js';
import { MSG } from '../../utils/messages.js';
import { validateLogForm } from '../../utils/validation.js';
import { useMe } from '../../providers/meContext.jsx';
import { useToast } from '../../providers/toastContext.js';

export default function QuickUpdateForm({ bookId, totalPages, onSaved }) {
  const { me } = useMe() ?? {};
  const isReadOnly = !!me?.isReadOnly;

  const { showToast } = useToast();

  const [form, setForm] = useState({
    cumulativePages: '',
    minutes: '',
    dateJst: jstToday(),
    memo: '',
  });

  // 項目ごとのエラー + グローバルエラー（_global）
  const [errors, setErrors] = useState({});
  // サーバーエラーや一般的なエラー
  const [submitError, setSubmitError] = useState('');
  // 送信中フラグ
  const [saving, setSaving] = useState(false);

  // 共通 onChange ハンドラ
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    // 入力中項目のエラーを入力中はクリアする（blur時にバリデーション → エラー表示する）
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next._global;
      return next;
    });
  };

  // blur 時に単項目＋グローバルのバリデーションを行う
  const handleBlur = (field) => () => {
    const result = validateLogForm(form, { totalPages });
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

  // フォームとエラーメッセージをリセット
  const resetForm = () => {
    setForm({
      cumulativePages: '',
      minutes: '',
      dateJst: jstToday(),
      memo: '',
    });
    setErrors({});
    setSubmitError('');
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

    const result = validateLogForm(form, { totalPages });

    if (!result.ok) {
      // 項目ごとのエラーとグローバルエラーを反映
      setErrors(result.errors);
      return;
    }

    setSaving(true);
    try {
      // 正規化済みの値をそのまま API に送信
      await api.post(`/api/books/${bookId}/logs`, result.values);

      const msg = api.getLastMessage();
      if (msg) {
        showToast({ type: 'success', message: msg });
      }

      resetForm();
      onSaved?.();
    } catch (err) {
      setSubmitError(err?.message || MSG.FE.ERR.GENERAL_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const globalMessage = errors._global || submitError;
  const isDisabled = saving || isReadOnly;

  return (
    <form onSubmit={handleSubmit} className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
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

      {/* 累計ページ */}
      <div>
        <label className="mb-1 block text-xs">
          累計ページ <span className="text-destructive">*</span>
        </label>
        <Input
          type="number"
          min="0"
          placeholder={MSG.FE.UI.PLACEHOLDER.CUMULATIVE_PAGES}
          value={form.cumulativePages}
          onChange={handleChange('cumulativePages')}
          onBlur={handleBlur('cumulativePages')}
          disabled={isDisabled}
        />
        {errors.cumulativePages && (
          <FormFieldError message={errors.cumulativePages} className="mt-1" />
        )}
      </div>

      {/* 読書時間（分） */}
      <div>
        <label className="mb-1 block text-xs">読書分</label>
        <Input
          type="number"
          min="0"
          placeholder={MSG.FE.UI.PLACEHOLDER.MINUTES}
          value={form.minutes}
          onChange={handleChange('minutes')}
          onBlur={handleBlur('minutes')}
          disabled={isDisabled}
        />
        {errors.minutes && <FormFieldError message={errors.minutes} className="mt-1" />}
      </div>

      {/* 日付 */}
      <div>
        <label className="mb-1 block text-xs">
          日付 <span className="text-destructive">*</span>
        </label>
        <Input
          type="date"
          placeholder={MSG.FE.UI.PLACEHOLDER.DATE}
          value={form.dateJst}
          onChange={handleChange('dateJst')}
          onBlur={handleBlur('dateJst')}
          disabled={isDisabled}
        />
        {errors.dateJst && <FormFieldError message={errors.dateJst} className="mt-1" />}
      </div>

      {/* メモ */}
      <div>
        <label className="mb-1 block text-xs">メモ（任意）</label>
        <Input
          placeholder={MSG.FE.UI.PLACEHOLDER.MEMO}
          value={form.memo}
          onChange={handleChange('memo')}
          onBlur={handleBlur('memo')}
          disabled={isDisabled}
        />
        {errors.memo && <FormFieldError message={errors.memo} className="mt-1" />}
      </div>

      {/* ボタン */}
      <div className="flex justify-end pt-1 sm:col-span-2">
        <Button type="submit" loading={saving} disabled={isDisabled}>
          進捗を保存
        </Button>
      </div>
    </form>
  );
}
