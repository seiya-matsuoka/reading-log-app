// フロントエンド専用のメッセージ定義（ID : 文言）
// - サーバ由来の文言は重複定義しなし（バックエンド側の message はそのまま表示する）
// - クライアント側バリデーション、エラー、UIコピー、確認ダイアログなどのみを定義

export const MSG = Object.freeze({
  FE: {
    // エラー（フロント側）
    ERR: {
      // 通信・予期せぬエラー
      NETWORK: 'ネットワークエラーが発生しました。接続を確認してください。',
      OFFLINE: 'オフラインのため処理を実行できません。',
      JSON_PARSE: 'サーバ応答の解析に失敗しました。',
      UNKNOWN: '不明なエラーが発生しました。',
      BOOKLIST: '書籍一覧の取得に失敗しました。',
      BOOKDETAIL: '対象の書籍が見つかりません。',

      // 共通系（フォーム種別に依存しないもの）
      GENERAL_READONLY: '読み取り専用ユーザーのため、この操作は行えません。',
      GENERAL_SAVE_FAILED: '保存に失敗しました。しばらく時間をおいてから再度お試しください。',

      // クライアント側のバリデーション
      VALID: {
        // グローバル（複数フォームで共通）
        LINK_NOT_ALLOWED: 'リンクやURLは入力できません。',

        // Books（新規・更新フォーム）
        BOOK: {
          TITLE_REQUIRED: 'タイトルは必須です。',
          TITLE_MAXLEN_200: 'タイトルは200文字以内で入力してください。',
          AUTHOR_MAXLEN_100: '著者は100文字以内で入力してください。',
          ISBN_FORMAT_10_13: 'ISBNは10桁または13桁の半角数字で入力してください。',
          TOTAL_PAGES_REQUIRED: '総ページ数は必須です。',
          TOTAL_PAGES_INTEGER: '総ページ数は整数で入力してください。',
          TOTAL_PAGES_POSITIVE: '総ページ数は1以上の整数で入力してください。',
        },

        // Logs（クイック更新フォーム）
        LOG: {
          CUMULATIVE_PAGES_INTEGER: '読了ページ数は整数で入力してください。',
          CUMULATIVE_PAGES_NONNEGATIVE: '読了ページ数は0以上の整数で入力してください。',
          CUMULATIVE_PAGES_NOT_EXCEED_TOTAL:
            '読了ページ数は総ページ数を超えないように入力してください。',
          MINUTES_INTEGER: '読書時間（分）は整数で入力してください。',
          MINUTES_NONNEGATIVE: '読書時間（分）は0以上の整数で入力してください。',
          DATE_FORMAT: '日付はYYYY-MM-DD形式で入力してください。',
          DATE_FUTURE_FORBIDDEN: '未来日を指定することはできません。',
          MEMO_MAXLEN_500: 'メモは500文字以内で入力してください。',
        },

        // Notes（書籍メモ）
        NOTE: {
          BODY_REQUIRED: 'ノート本文は必須です。',
          BODY_MAXLEN_500: 'ノート本文は500文字以内で入力してください。',
        },
      },
    },

    // UIコピー（説明文・空状態・プレースホルダ等）
    UI: {
      // ログイン画面
      LOGIN: {
        HELP: 'デモアプリのため通常の認証は行いません。以下のプルダウンで「デモユーザー」を選択してログイン（ユーザー切替）してください。',
      },

      // ユーザー登録画面
      REGISTER: {
        HELP: 'デモアプリのためユーザーの新規登録はできません。ログイン画面で「デモユーザー」を選択してログイン（ユーザー切替）してください。',
      },

      // 書籍一覧画面
      BOOKLIST: {
        HELP: '「新規書籍」から記録する書籍を登録してください。',
      },

      // 空状態
      EMPTY: {
        BOOKS: '登録された書籍はありません。',
        LOGS: '読書ログはまだありません。',
        NOTES: 'メモはまだありません。',
        STATS: 'この月の統計データはありません。',
      },

      // プレースホルダ
      PLACEHOLDER: {
        SEARCH: 'タイトル／著者で検索…',
        ISBN: '10桁または13桁のISBN',
        TITLE: 'タイトル',
        AUTHOR: '著者',
        TOTAL_PAGES: '総ページ数',
        CUMULATIVE_PAGES: '読了ページ数',
        MINUTES: '読書時間（分）',
        DATE: 'YYYY-MM-DD',
        MEMO: 'メモ（任意・500文字以内）',
        NOTE: 'ノート本文（500文字以内）',
      },

      // ローディング系
      LOADING: {
        DEFAULT: '読み込み中…',
        STATS: '統計を取得中…',
      },
    },

    // 確認ダイアログ
    CONFIRM: {
      DELETE_BOOK: 'この書籍を削除しますか？',
      UNDO_LOG: '直前の読書ログを取り消しますか？',
      DELETE_NOTE: 'このメモを削除しますか？',
    },

    // クライアント側Info
    INFO: {
      LOGIN_SWITCHED: 'ユーザーを切り替えました。',
      FORM_UNSAVED: '未保存の変更があります。',
    },
  },
});
