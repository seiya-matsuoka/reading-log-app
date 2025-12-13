# 読書記録アプリ｜基本設計（実装版）

> 目的：実装中の迷いを減らし、MVP完成時の網羅確認に使える“最小限の基本設計”を定義する。  
> 実装完了後の状態に合わせた「実装版」とする（コード詳細は含めない）。

---

## 0. 前提・範囲（確定）

- **分離構成**
  - Front：Vite + React（SPA）｜Vercel（静的ホスティング＋SPAフォールバック）
  - Back：Node.js + Express（常駐）｜Render
  - DB：Vercel Postgres（PostgreSQL互換）｜生SQLを `.sql` ファイルで管理

- **デモ認証**
  - デモユーザー4名（うち1名は読み取り専用）。
  - 初期アクセス時は **demo-1 ログイン状態**。
  - ログアウト機能なし。ログイン画面は「ユーザー切替 UI」のみ。

- **機能スコープ（MVP）**
  - 書籍 CRUD（ソフトデリート）
  - 読書ログ：**累計入力 → 差分自動計算**
  - メモ（書籍に紐づく自由メモ）
  - 一覧／詳細
  - 軽量統計（今月＋過去月）

- **非目標**
  - 外部リンク／画像アップロード、インポート／エクスポート UI
  - アプリ内初期化 UI
  - 本格的なユーザー認証・権限管理
  - ユニットテスト（動作確認は手動テストで行う）

- **ログ運用**
  - **ログファイルの生成・書き込みは行わない**。
  - 必要最小限の `console` 出力のみ（Render ログ・ブラウザコンソールで確認）。

---

## 1. 画面一覧 & 主要動線（最小）

- **/login**
  - デモユーザー切替画面。
  - プルダウンで `demo-1 / demo-2 / demo-3 / demo-readonly` を選択し、「ログイン」ボタンで切替。
  - パスワード入力は行わず、「デモアプリであること」「通常の認証は行わないこと」の注意書きを表示。

- **/register**
  - 表示のみ。
  - 「このアプリでは新規登録はできない（デモユーザーのみ）」旨の説明テキストを表示。
  - 入力フォームや登録処理は持たない。

- **/books**
  - 書籍一覧画面。
  - 機能：
    - 検索（タイトル／著者のテキスト検索）
    - 状態フィルタ（すべて／読書中／読了）
    - 軽量統計バー（今月の合計ページ数／1日平均など）
    - 書籍カード表示（タイトル、著者、状態、進捗バー、累計時間など）
    - クイック更新フォーム（**累計読了ページ＋任意の読書時間＋任意の短いメモ**）
      - 読み取り専用ユーザーの場合はフォームを無効化／非表示。
  - ローディング：
    - 初回ロード時は SkeletonCard（シマーアニメーション付き）を複数表示。
    - 一定時間（約5秒）以上かかる場合、ページ全体に「サーバ起動に時間がかかる旨」の説明と大きめスピナーを追加表示。

- **/books/new**
  - 新規書籍登録画面。
  - 入力項目：
    - 必須：書籍名（タイトル）、総ページ数
    - 任意：著者、出版社、ISBN（10桁 or 13桁の数字のみ。ハイフン無し）
  - 書籍に紐づくメモ（Notes）は **ここでは入力しない**。登録後、詳細画面で追加。

- **/books/:id**
  - 書籍詳細画面。
  - レイアウト（2行×2カラム）：
    - **上段 左：書籍情報カード**
      - 書籍の基本情報を表示：
        - タイトル
        - 著者
        - 出版社
        - ISBN
        - 最終更新日
      - 進捗情報：
        - 現在の累計ページ数
        - 総ページ数
        - 進捗率（％表示）
        - 累計読書時間（分）
      - 「編集」ボタンで **閲覧モード／編集モードを切り替え**。
        - 編集モードでは `BookForm` を埋め込み表示し、タイトル・総ページ数・著者・出版社・ISBN を更新できる。
      - 「書籍を削除」ボタンでソフトデリート。
      - 読み取り専用ユーザーの場合：
        - 編集ボタン／削除ボタンは無効化。
    - **上段 右：進捗入力カード**
      - 見出し：「進捗を記録」。
      - 入力内容：
        - 現在の「累計読了ページ数」
        - 読書時間（分、任意）
        - 日付（JST。省略時は今日）
        - 短いメモ（任意、リンク禁止）
      - 保存時：
        - サーバ側で直近ログとの差分ページ数を計算し、`books.pages_read` / `books.minutes_total` / `reading_logs` を更新。
        - 保存成功後、書籍情報・ログ・メモを再取得して画面を最新化。
      - 読み取り専用ユーザーの場合：
        - フォーム全体を無効化／非表示。
    - **下段 左：メモカード**
      - 書籍に紐づくメモ一覧と、メモの追加／編集／削除を提供。
      - 構成：
        - メモ追加フォーム（本文 1〜500文字・リンク禁止）
        - メモ一覧（新しい順）：
          - 本文
          - 作成日
          - 編集／削除ボタン（読み取り専用ユーザーは無効化）
      - バリデーションエラー・保存失敗時はカード内にエラーメッセージを表示。
    - **下段 右：ログ履歴カード**
      - 「ログ履歴」見出しと、「直前のログを削除」ボタンを表示。
      - ログ一覧（新しい順）：
        - 日付（JST）
        - 「＋Nページ」（差分ページ数）
        - 累計ページ数
        - 読書時間（分）
        - メモ（任意）
      - 「直前のログを削除」ボタン：
        - 対象書籍について **最新の1件のみ** Undo する。
        - Undo 後は書籍の `pages_read`／`minutes_total` も巻き戻される。
        - 読み取り専用ユーザーは実行不可（ボタン無効化）。
      - ログが存在しない場合は、「ログがありません」系の空状態メッセージを表示。
  - 読み取り専用ユーザーの場合：
    - 編集・削除・ログ追加・ログUndo・メモ追加／編集／削除など、書き込み操作の UI はすべて無効化。
    - 閲覧のみ可能。

- **/not-found**（内部ルート）
  - 存在しないパスに対応する 404 画面。
  - 「ページが見つかりません」メッセージと、`/books` へのリンクを表示。

- **共通ヘッダー**
  - ロゴ／アプリ名（リンクで `/books`）。
  - ナビゲーションリンク：
    - 書籍一覧 `/books`
    - 新規書籍 `/books/new`
    - ログイン `/login`
    - ユーザー登録 `/register`

---

## 2. SPAルーティング（Front）

- **使用ライブラリ**
  - React Router（BrowserRouter）。

- **ルート一覧**
  - `/login`
  - `/register`
  - `/books`
  - `/books/new`
  - `/books/:id`
  - `*`（NotFound）

- **SPAフォールバック**
  - Vercel の設定で、任意のパスへの直接アクセス時も `index.html` を返すようにする。
  - React Router 側で上記ルートにマッピングし、存在しないパスは NotFound へ。

---

## 3. REST API（Back）

- **ベースパス**
  - すべての JSON API は `/api/*` 配下とする。

- **デモユーザー指定**
  - HTTP ヘッダ `X-Demo-User` に `demo-1|demo-2|demo-3|demo-readonly` を指定。
  - ミドルウェアで `req.demoUser` として展開し、読み取り専用ユーザーの場合は `req.isReadOnly = true` を設定。

- **レスポンスフォーマット**
  - JSON を基本とし、成功時は以下の構造：
    - `200 OK: { data: ..., message?: string }`
    - `201 Created: { data: ..., message?: string }`
    - `204 No Content: （レスポンスボディなし）`
  - `message` はバックエンド側の `MSG` 定数から選んだ **日本語テキスト** であり、
    保存／更新／削除／Undo などの結果メッセージを表す。
  - エラー時は HTTP ステータスコードに加え、以下のような構造：
    - `4xx/5xx: { error: true, message: string }`
  - フロントエンド（`api.js`）は、
    - `json.message` または `json.data.message` を「最後のメッセージ」として保持（`getLastMessage()` で参照）
    - `!res.ok` または `json.error === true` の場合は `Error(message)` を投げる。
  - 汎用 UI 文言・ネットワークエラー等はフロント側の `MSG.FE.*` で管理。

- **ステータスコード方針**
  - 成功：`200 OK / 201 Created / 204 No Content`
  - クライアントエラー：`400 Bad Request / 403 Forbidden / 404 Not Found / 409 Conflict`
  - サーバエラー：`500 Internal Server Error`

- **代表エンドポイント（MVP）**
  - 共通
    - `GET /api/me`
      - 現在のデモユーザー情報を返す：`{ id, code, name, isReadOnly }`
  - 書籍（Books）
    - `GET /api/books`
      - クエリ：`q`（キーワード）、`state=reading|done`（状態フィルタ）
      - レスポンス：書籍カード用の一覧。
    - `POST /api/books`
      - ボディ：`{ title, total_pages, author?, publisher?, isbn? }`
      - 検証後に新規書籍を作成。
    - `GET /api/books/:id`
      - 書籍詳細用の情報を返す（進捗やログ概要、Notes の一部を含む構造は詳細設計参照）。
    - `PATCH /api/books/:id`
      - 書籍の基本情報を更新。
    - `DELETE /api/books/:id`
      - ソフトデリート（`deleted_at` を設定）。
  - 読書ログ（Reading Logs）
    - `GET /api/books/:id/logs`
      - 指定書籍のログを新しい順で返す。
    - `POST /api/books/:id/logs`
      - ボディ：`{ cumulative_pages, minutes?, date_jst?, memo? }`
      - 累計ページと前回値との差分を算出し、Books の `pages_read`／`minutes_total` を更新。
    - `DELETE /api/books/:id/logs/last`
      - 指定書籍の「最新ログ1件」を Undo（削除）し、Books のカウンタを巻き戻す。
  - メモ（Notes）
    - `GET /api/books/:id/notes`
      - 指定書籍に紐づく Notes 一覧を返す。
    - `POST /api/books/:id/notes`
      - ボディ：`{ body }`（本文必須・最大500文字・リンク禁止）。
    - `GET /api/notes/:noteId`
      - 単一ノートを取得（編集フォーム用）。
    - `PATCH /api/notes/:noteId`
      - ノート本文を更新。
    - `DELETE /api/notes/:noteId`
      - ノートを削除。
  - 統計（Stats）
    - `GET /api/stats/monthly?year=YYYY&month=MM`
      - 指定年月（JST）の合計ページ数と1日平均を返す。

---

## 4. データモデル（項目レベル）

### users

- `id` (text, PRIMARY KEY)
  - デモユーザーコード（例：`demo-1`, `demo-readonly`）。
- `name` (text, NOT NULL)
  - 表示名。
- `is_read_only` (boolean, NOT NULL, DEFAULT false)
  - 読み取り専用ユーザーかどうか。
- `created_at` (timestamp with time zone, NOT NULL, DEFAULT now())

### books

- `id` (bigserial, PRIMARY KEY)
- `user_id` (text, NOT NULL, FK → users.id)
  - 所有ユーザー。
- `title` (text, NOT NULL)
  - 書籍タイトル。
- `total_pages` (integer, NOT NULL, CHECK total_pages >= 1)
  - 書籍の総ページ数。
- `author` (text, NULL)
  - 著者名。
- `publisher` (text, NULL)
  - 出版社。
- `isbn` (text, NULL)
  - ISBN。10桁または13桁の数字のみ（ハイフン無し）。
- `pages_read` (integer, NOT NULL, DEFAULT 0)
  - 累計読了ページ数。
- `minutes_total` (integer, NOT NULL, DEFAULT 0)
  - 累計読書時間（分）。
- `state` (text, NOT NULL, DEFAULT 'reading', CHECK state IN ('reading', 'done'))
  - 読書状態。
- `deleted_at` (timestamp with time zone, NULL)
  - ソフトデリート日時。NULL の場合は有効。
- `created_at` (timestamp with time zone, NOT NULL, DEFAULT now())
- `updated_at` (timestamp with time zone, NOT NULL, DEFAULT now())

### reading_logs

- `id` (bigserial, PRIMARY KEY)
- `book_id` (bigint, NOT NULL, FK → books.id)
- `user_id` (text, NOT NULL, FK → users.id)
- `date_jst` (date, NOT NULL)
  - 日本時間基準の日付。
- `cumulative_pages` (integer, NOT NULL, CHECK cumulative_pages >= 0)
  - ログ時点での累計読了ページ数。
- `minutes` (integer, NOT NULL, DEFAULT 0, CHECK minutes >= 0)
  - そのログで読んだ時間（分）。
- `memo` (text, NULL)
  - 任意の短いメモ（最大文字数はバリデーションで制御）。
- `created_at` (timestamp with time zone, NOT NULL, DEFAULT now())

### notes

- `id` (bigserial, PRIMARY KEY)
- `book_id` (bigint, NOT NULL, FK → books.id)
- `user_id` (text, NOT NULL, FK → users.id)
- `body` (text, NOT NULL)
  - ノート本文（最大500文字程度、リンク禁止）。
- `created_at` (timestamp with time zone, NOT NULL, DEFAULT now())

---

## 5. ビジネスルール（コア）

- **書籍状態自動判定**
  - `pages_read >= total_pages` の場合：`state = 'done'`
  - それ未満：`state = 'reading'`
  - 手動で `reading/done` を切り替える UI は提供しない。

- **ログ登録（累計入力 → 差分計算）**
  - ユーザーは **累計読了ページ数（cumulative_pages）** を入力する。
  - サーバ側で直近ログの `cumulative_pages` と比較し、
    - `delta = 新しい累計 - 直近累計`
    - `delta <= 0` の場合はエラー。
  - `pages_read` の更新：
    - `pages_read = min(total_pages, cumulative_pages)` として、上限を総ページ数に丸める。
  - `minutes_total` の更新：
    - `minutes_total += (minutes || 0)` として累積する。

- **Undo（直前ログのみ）**
  - 対象書籍ごとに **最新1件のログのみ** を Undo できる。
  - Undo実行時：
    - 最新ログレコードを削除。
    - 巻き戻し後の `pages_read`／`minutes_total` を再計算または差分で更新。
  - ログが1件も存在しない場合はエラー（404 相当）として扱う。

- **メモ（Notes）**
  - Notes は書籍に紐づく「自由メモ」であり、読書ログとは別に管理する。
  - 本文は必須・最大500文字・リンク禁止。

- **読み取り専用ユーザー**
  - `is_readonly = true` のユーザーは書き込み操作が禁止。
  - サーバ：書き込み系 API（POST／PATCH／DELETE）は 403 を返す。
  - フロント：フォームやボタンを無効化し、「読み取り専用」の注意文を表示。

---

## 6. バリデーション（サーバ／クライアント共通方針）

- **共通前処理**
  - Unicode NFKC 正規化（全角半角揺れを吸収）。
  - ゼロ幅スペース等の不可視文字を除去。
  - `hasLink` 判定で、`://`／`www.`／一部短縮URLなどを検出した場合はエラー。

- **書籍（Books）**
  - `title`
    - 必須、1〜200文字程度。
    - リンク禁止。
  - `total_pages`
    - 必須、1〜100000 の整数。
  - `author`, `publisher`
    - 任意、0〜120文字程度。
    - リンク禁止。
  - `isbn`
    - 任意。
    - 10桁または13桁の数字のみ（ハイフン不可）。

- **読書ログ（Reading Logs）**
  - `cumulative_pages`
    - 必須、0以上の整数。
    - 直近の `cumulative_pages` より大きくなければエラー。
  - `minutes`
    - 任意、0以上の整数。
  - `memo`
    - 任意、最大約300文字（目安）。
    - リンク禁止。

  - `date_jst`
    - 必須（API 上は省略時に当日扱いでもよいが、内部的には日付必須）。
    - `isValidDateJstOrEmpty` で日付形式を検証。
    - `isNotFutureJst` で「日本時間の今日より未来ではない」ことを確認。

- **メモ（Notes）**
  - `body`
    - 必須、1〜500文字。
    - リンク禁止。


---

## 7. 統計仕様（JST）

- **対象月**
  - クエリパラメータ `year`, `month` を **JST の年月** として解釈。
  - 当月／過去月を指定可能。

- **集計ロジック**
  - 指定月の `reading_logs` を抽出。
  - 各ログの `delta`（差分ページ数）を集計して「合計読了ページ数」を算出。
  - 合計ページ数 ÷ その月の日数（または読書があった日数）で 1日平均ページ数を計算（小数第1位程度まで）。

- **レスポンスイメージ**
  - `GET /api/stats/monthly?year=2025&month=11` →
    - `{ data: { year: 2025, month: 11, totalPages: 1234, avgPerDay: 41.1 } }` のような構造（正確なキーは詳細設計参照）。

---

## 8. セキュリティ・CORS・制限

- **CORS**
  - 環境変数 `FRONTEND_ORIGIN` で指定されたオリジンのみ許可。
  - `Access-Control-Allow-Headers` に `X-Demo-User, Content-Type` を含める。

- **読み取り専用ガード**
  - サーバ：`req.isReadOnly` を見て書き込み API を拒否（403）。
  - フロント：isReadOnly コンテキストに応じてボタン／フォームを無効化。

- **XSS 対策**
  - API は JSON のみ返却し、HTML を返さない。
  - React 側では基本的に JSX のテキストバインドとする。

---

## 9. エラーメッセージ運用

- **命名規則（バックエンド）**
  - `ERR_*`, `INFO_*`, `WARN_*` をプレフィックスとした定数名で `MSG` オブジェクトに定義。
  - 例：
    - `MSG.ERR_BAD_REQUEST`
    - `MSG.ERR_NOT_FOUND`
    - `MSG.ERR_LINK_FORBIDDEN`
    - `MSG.INFO_SAVED`
    - `MSG.INFO_DELETED`
    - `MSG.INFO_UNDO_DONE`

- **バックエンドでの利用**
  - コントローラは `http.ok`, `http.bad`, `http.notFound`, `http.error` などに `MSG.*` を渡し、
    - 成功時：`{ data, message }`
    - 失敗時：`{ error: true, message }`
    を返す。
  - この `message` がそのままユーザー向けメッセージとなる。

- **フロントエンドのメッセージ**
  - `frontend/src/utils/messages.js` で **フロント専用メッセージ**（`MSG.FE.*`）を定義。
    - ネットワークエラーの汎用文言（`MSG.FE.ERR.NETWORK` 等）
    - 画面固有のラベル・説明文・空状態メッセージ（`MSG.FE.UI.*`）
    - Confirm ダイアログ用文言（`MSG.FE.CONFIRM.*`）
  - サーバ由来の `message` と重複するテキストは原則定義しない。

- **フロントでの使い分け**
  - 成功時：
    - `api.getLastMessage()` で取得したサーバ由来 `message` をトーストなどに表示。
    - UI ラベルや見出しは `MSG.FE.UI.*` を使用。
  - 失敗時：
    - `err.message`（サーバ由来）を優先して表示。
    - 予期しない形式の場合は `MSG.FE.ERR.NETWORK` などの汎用文言にフォールバック。

---

## 10. ログ・監査・テスト方針

- **アクセスログ**
  - ログファイルへの永続保存は行わない。

- **アプリログ**
  - DB エラーなどの異常系も `console.error` で最小限出力。

- **監査情報**
  - 主なテーブル（books, reading_logs, notes）には `created_at`／`updated_at`／`deleted_at`（books）を保持。
  - `created_by` のような詳細な監査カラムは今回のスコープ外。

- **テスト**
  - ユニットテストは持たず、**実操作による手動確認**のみを行う。
  - チェックリストは「13. 手動テスト観点」で定義。

---

## 11. デプロイ・環境・リージョン

- **リージョン**
  - Vercel Postgres：Singapore リージョン
  - Render（API）：Singapore リージョン

- **環境変数（Back｜Render）**
  - `DATABASE_URL_POOLED`：Vercel Postgres 用接続文字列。
  - `FRONTEND_ORIGIN`：CORS 許可するフロント URL。
  - `NODE_ENV`：`development` / `production` 等。
  - その他、必要に応じてログレベルなど。

- **環境変数（Front｜Vercel）**
  - `VITE_API_BASE_URL`：バックエンド API のベース URL。
  - 公開して良い値のみを使用する。

- **DEV/PROD 分離**
  - 開発用と本番用で URL／接続先を分離。
  - `.env`（ローカル）と Vercel／Render の管理画面を使って環境変数を設定。

- **SPAフォールバック**
  - Vercel 設定（`vercel.json` 等）で、未知のパスも `index.html` にフォールバック。
  - フロント側のルーティングで 404 判定を行う。

---

## 12. シード / 初期化（運用）

- **実行方法**
  - コマンドラインスクリプト（例：`node migrate.js`／`node seed.js`）でマイグレーション＋シードを実行。
  - アプリ内には「DBリセット」などの UI は持たない。

- **内容**
  - `0001_demo_users.sql`〜`0004_demo_notes.sql` などでデモユーザー・書籍・ログ・メモを投入。
  - デモ体験に必要な程度のデータ量に留める。

---

## 13. 手動テスト観点（チェックリスト）

- 書籍作成 → 一覧反映 → 詳細編集 → ログ登録（**累計入力 → ＋Nページ表示**） → 読了到達で自動状態遷移。
- 直前ログ Undo → 進捗／合計時間の巻き戻し → 一覧・詳細で値が戻っていること。
- 読み取り専用ユーザーで書き込み操作を試みると UI が無効化され、API も 403 を返すこと。
- 未来日／リンク混入／ISBN不正などのバリデーションがクライアント／サーバ両方で機能していること。
- 月次統計（今月／過去月）で、登録済みログに応じて数値が変わること。
- コールドスタート時：
  - 初回一覧アクセスでローディング画面が表示されること。
  - 一定時間経過後に「サーバ起動中」の説明とスピナーが表示されること。
  - 起動完了後に一覧が正常に表示されること。

---

## 14. フロント実装ポリシー（最小）

- **APIクライアント**
  - `lib/api.js` に薄いラッパを定義。
    - `baseURL`（`VITE_API_BASE_URL`）の適用。
    - `X-Demo-User` ヘッダの共通付与。
    - レスポンス JSON から `data` のみを返却。
    - `message` を内部に一時保持し、`getLastMessage()` で参照可能にする。
    - エラー時は `Error(message)` を投げる。

- **バリデーション表示**
  - 基本は **submit 時＋初回 blur 時** にクライアントバリデーションを行い、エラー文言を入力欄の近くに表示。
  - サーバで NG となった場合も、`err.message` または `MSG.FE.ERR.*` を用いて画面に表示。

- **ローディング**
  - 一覧画面ロード：Skeleton カード＋標準ローディング文言。
  - 詳細画面ロード：Skeleton カード＋標準ローディング文言。
  - ハードに時間がかかる場合（数秒以上）：
    - 専用コンポーネント（ページローディング）で「サーバ起動中の可能性がある」ことを明示（スピナー＋専用ローディング文言＋Skeleton）。

- **日付表示**
  - 一貫して `YYYY/MM/DD`（JST）フォーマットを使用。
  - `formatYmd` 等の共通ユーティリティで変換。

