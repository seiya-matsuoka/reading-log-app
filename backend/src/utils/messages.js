// メッセージ定義（キー → 日本語）
export const MSG = Object.freeze({
  // --- 共通情報 ---
  INFO_SAVED: '保存しました',
  INFO_DELETED: '削除しました',
  INFO_NO_RESULTS: '該当するデータはありません',
  INFO_UNDO_DONE: '直前の記録を取り消しました',

  // --- 共通エラー ---
  ERR_BAD_REQUEST: '不正なリクエストです',
  ERR_FORBIDDEN_READONLY: '読み取り専用ユーザーのため操作できません',
  ERR_NOT_FOUND: '対象データが見つかりません',
  ERR_CONFLICT: '競合が発生しました',
  ERR_INTERNAL: 'サーバ内部でエラーが発生しました',
  ERR_RATE_LIMIT: 'リクエストが多すぎます。しばらくしてからお試しください',

  // --- Books ---
  ERR_TITLE_REQUIRED: 'タイトルは必須です',
  ERR_LINK_FORBIDDEN: 'リンクの貼り付けは禁止です',
  ERR_TOTAL_PAGES_RANGE: '総ページ数の値が不正です',
  ERR_ISBN_FORMAT: 'ISBNの形式が不正です',

  // --- Logs ---
  ERR_LOG_DIFF_ZERO: '前回からの増分がありません',
  ERR_LOG_REVERSE: '前回より小さい値は入力できません',
  ERR_PAGES_OUT_OF_RANGE: 'ページ数の値が不正です',
  ERR_MINUTES_OUT_OF_RANGE: '読書時間の値が不正です',
  ERR_DATE_PARSE: '日付の形式が不正です',
  ERR_DATE_FUTURE_FORBIDDEN: '未来日を指定することはできません',

  // --- Notes ---
  ERR_NOTE_MAXLEN: 'メモは500文字以内で入力してください',
});
