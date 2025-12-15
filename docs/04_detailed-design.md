# 読書記録アプリ｜詳細設計（実装版）

> 前提：JavaScriptのみ（TypeScript不使用）。  
> 分離構成：Frontend（Vite + React｜Vercel静的 + SPAフォールバック）／Backend（Express｜Render常駐）／DB（Vercel Postgres｜生SQL）。  
> 目的：実装の「ソースコード寄り」の仕様を文章化する。

---

## 0. ドキュメントの位置づけ

- **仕様まとめ（01）**  
  アプリ全体の機能・ストーリー・MVP範囲を記述。
- **企画・要件定義（02）**  
  機能要件／非機能要件／API・DB方針などの「何を」「どこまで」を定義。
- **基本設計（03）**  
  画面一覧・ルーティング・テーブル構造・API一覧などの構造レベルを定義。
- **本ドキュメント（詳細設計）**  
  上記を前提に、**ファイル単位の責務・処理フロー・SQL・バリデーション・メッセージ設計**などを実装レベルまで具体化する。

---

## 1. リポジトリ構成（実装版）

### 1.1 全体構成

```
reading-log-app/
├─ backend/
│  ├─ scripts/
│  │  ├─ migrate.js
│  │  └─ seed.js
│  ├─ sql/
│  │  ├─ migrations/
│  │  │  └─ 0001_init.sql
│  │  ├─ queries/
│  │  │  ├─ books/
│  │  │  │  ├─ get_book_counters.sql
│  │  │  │  ├─ get_book.sql
│  │  │  │  ├─ insert_book.sql
│  │  │  │  ├─ list_books.sql
│  │  │  │  ├─ soft_delete_book.sql
│  │  │  │  ├─ update_book_counters.sql
│  │  │  │  └─ update_book.sql
│  │  │  ├─ logs/
│  │  │  │  ├─ delete_latest_log.sql
│  │  │  │  ├─ get_latest_log.sql
│  │  │  │  ├─ insert_log.sql
│  │  │  │  └─ list_logs.sql
│  │  │  ├─ notes/
│  │  │  │  ├─ delete_note.sql
│  │  │  │  ├─ get_note.sql
│  │  │  │  ├─ insert_note.sql
│  │  │  │  ├─ list_notes.sql
│  │  │  │  └─ update_note.sql
│  │  │  └─ stats/
│  │  │     └─ get_monthly_pages.sql
│  │  └─ seeds/
│  │     ├─ 0000_reset_all.sql
│  │     ├─ 0001_demo_users.sql
│  │     ├─ 0002_demo_books.sql
│  │     ├─ 0003_demo_reading_logs.sql
│  │     └─ 0004_demo_notes.sql
│  ├─ src/
│  │  ├─ config/
│  │  │  └─ env.js
│  │  ├─ controllers/
│  │  │  ├─ bookController.js
│  │  │  ├─ logController.js
│  │  │  ├─ noteController.js
│  │  │  └─ statsController.js
│  │  ├─ db/
│  │  │  └─ pool.js
│  │  ├─ middleware/
│  │  │  ├─ cors.js
│  │  │  ├─ demoUser.js
│  │  │  ├─ errorHandler.js
│  │  │  └─ readonlyGuard.js
│  │  ├─ repositories/
│  │  │  ├─ bookRepository.js
│  │  │  ├─ logRepository.js
│  │  │  ├─ noteRepository.js
│  │  │  └─ statsRepository.js
│  │  ├─ routes/
│  │  │  ├─ books.js
│  │  │  ├─ health.js
│  │  │  ├─ logs.js
│  │  │  ├─ me.js
│  │  │  ├─ notes.js
│  │  │  └─ stats.js
│  │  ├─ services/
│  │  │  ├─ bookService.js
│  │  │  ├─ logService.js
│  │  │  ├─ noteService.js
│  │  │  └─ statsService.js
│  │  ├─ utils/
│  │  │  ├─ date.js
│  │  │  ├─ http.js
│  │  │  ├─ messages.js
│  │  │  └─ validation.js
│  │  ├─ app.js
│  │  └─ index.js
│  ├─ .env
│  ├─ .env.example
│  ├─ .gitignore
│  ├─ .prettierignore
│  ├─ .prettierrc
│  ├─ eslint.config.mjs
│  ├─ package-lock.json
│  └─ package.json
├─ docs/
│  ├─ 00_docs-index.md
│  ├─ 01_spec-summary.md
│  ├─ 02_requirements.md
│  ├─ 03_basic-design.md
│  └─ 04_detailed-design.md
├─ frontend/
│  ├─ public/
│  │  ├─ ogp/
│  │  │  ├─ reading-log-app-og-1200x630.png
│  │  │  └─ reading-log-app-og-1200x1200.png
│  │  ├─ android-chrome-192x192.png
│  │  ├─ android-chrome-512x512.png
│  │  ├─ apple-touch-icon.png
│  │  ├─ favicon-16x16.png
│  │  ├─ favicon-32x32.png
│  │  ├─ favicon.ico
│  │  └─ site.webmanifest
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ books/
│  │  │  │  ├─ BookCard.jsx
│  │  │  │  ├─ BookForm.jsx
│  │  │  │  ├─ BookNotesSection.jsx
│  │  │  │  ├─ QuickUpdateForm.jsx
│  │  │  │  ├─ SearchBar.jsx
│  │  │  │  └─ StatsBar.jsx
│  │  │  └─ common/
│  │  │     ├─ Button.jsx
│  │  │     ├─ FormFieldError.jsx
│  │  │     ├─ Header.jsx
│  │  │     ├─ Input.jsx
│  │  │     ├─ PageLoading.jsx
│  │  │     ├─ Select.jsx
│  │  │     ├─ SkeletonCard.jsx
│  │  │     └─ Spinner.jsx
│  │  ├─ lib/
│  │  │  └─ api.js
│  │  ├─ pages/
│  │  │  ├─ BookDetail.jsx
│  │  │  ├─ BookNew.jsx
│  │  │  ├─ BooksList.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ NotFound.jsx
│  │  │  └─ Register.jsx
│  │  ├─ providers/
│  │  │  ├─ meContext.jsx
│  │  │  ├─ toastContext.js
│  │  │  └─ ToastProvider.jsx
│  │  ├─ styles/
│  │  │  └─ tailwind.css
│  │  ├─ utils/
│  │  │  ├─ date.js
│  │  │  ├─ messages.js
│  │  │  ├─ sanitize.js
│  │  │  └─ validation.js
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ routes.jsx
│  ├─ .env
│  ├─ .gitignore
│  ├─ .prettierignore
│  ├─ .prettierrc
│  ├─ eslint.config.mjs
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ vercel.json
│  └─ vite.config.js
├─ .gitignore
└─ README.md
```

---

## 2. バックエンド詳細

### 2.1 エントリーポイント／アプリ構成

#### `index.js`

- 役割：
  - `env.js` で環境変数を読み込む。
  - `app.js` から Express アプリを import。
  - `PORT`（Render が割り当て）で `app.listen`。

#### `app.js`

- 役割：
  - Express アプリを生成し、**共通ミドルウェア→ルータ→404→最終エラーハンドラ**の順で登録する。
- 登録順：
  1. `express.json()` を有効化
  2. `cors` ミドルウェア（`./middleware/cors.js`）
  3. `demoUser`：`req.demoUser`（文字列）と `req.isReadOnly`（boolean）を付与
  4. `readonlyGuard`：**ReadOnlyユーザー + 書き込み系メソッド(POST/PUT/PATCH/DELETE)** を 403 にする（グローバル適用）
  5. ルーティング：
     - `/health` → `healthRouter`
     - `/api/me` → `meRouter`
     - `/api/books` → `booksRouter`
     - `/api/books` → `logsRouter`
     - `/api` → `notesRouter`（Router側で books / notes スコープを分岐）
     - `/api` → `statsRouter`
  6. 404：`http.notFound(res)` で返却（JSON）
  7. 最終エラーハンドラ：`errorHandler`（4xx/5xxに正規化）
- 補足：
  - `readonlyGuard` は「書き込みルートにだけ適用」ではなく、**アプリ全体に適用され、HTTPメソッドで弾く**方式。

---

### 2.2 共通モジュール

#### `env.js`

- 役割：
  - `process.env` から必要な値を読み取り、最低限の検証を行う。
  - 主な項目：
    - `DATABASE_URL_POOLED`
    - `FRONTEND_ORIGIN`
    - `NODE_ENV`

#### `pool.js`

- 役割：
  - `pg` の `Pool` を生成して export する。
- 接続：
  - 環境変数 `DATABASE_URL_POOLED` を使用。
  - SSL：`ssl: { rejectUnauthorized: false }` を指定。

#### `cors.js`

- 役割：
  - `cors` パッケージを使った CORS ミドルウェアを export する。
- 設定：
  - `origin`：`process.env.FRONTEND_ORIGIN`（未指定時は `http://localhost:5173`）
  - `methods`：`GET, POST, PATCH, DELETE, OPTIONS`
  - `allowedHeaders`：`Content-Type`, `X-Demo-User`
  - `credentials`：`false`

#### `demoUser.js`

- 役割：
  - ログイン機能は持たず、**デモユーザーをヘッダで切替**する。
- 入力：
  - `X-Demo-User` ヘッダ（未指定 or 不正値は `demo-1` 扱い）。
- 許可値：
  - `demo-1`, `demo-2`, `demo-3`, `demo-readonly` のみ。
- 付与：
  - `req.demoUser`：ユーザーID文字列（例：`demo-1`）
  - `req.isReadOnly`：`demo-readonly` のとき `true`

#### `readonlyGuard.js`

- 役割：
  - ReadOnly ユーザーに対して **書き込み系HTTPメソッド** を 403 にする。
- 判定：
  - `req.isReadOnly === true` かつ `req.method` が `POST|PUT|PATCH|DELETE` のとき。
- 返却：
  - `http.forbidden(res)`。
- 補足：
  - ルート単位ではなく、`app.js` でグローバルに `app.use(readonlyGuard)` を適用する。

#### `errorHandler.js`

- 役割：
  - **最終エラーハンドラ**として、未捕捉エラーを 4xx/5xx に正規化して返す。
- 挙動：
  - `res.headersSent` の場合は `next(err)` に委譲。
  - 400：
    - `err.type === 'entity.parse.failed'` または `err.name === 'SyntaxError'`
    - → `http.bad(res, MSG.ERR_BAD_REQUEST)`
  - 409：
    - `err.code === '23505'`（unique_violation）
    - `err.code === '23503'`（foreign_key_violation）
    - → `http.conflict(res, MSG.ERR_CONFLICT)`
  - その他：
    - `http.error(res, MSG.ERR_INTERNAL)`
- 補足：
  - `err.status` を見て返すのではなく、**JSONパース失敗とPG制約系だけを特別扱い**する。

#### `http.js`

- 役割：
  - コントローラからのレスポンス生成を標準化するヘルパ。
- 主な関数：
  - `ok(res, data, message?)` → `200` + `{ data, message? }`
  - `created(res, data, message?)` → `201` + `{ data, message? }`
  - `noContent(res)` → `204` + ボディなし
  - `bad(res, message)` → `400` + `{ error: true, message }`
  - `forbidden(res, message)` → `403` + `{ error: true, message }`
  - `notFound(res, message)` → `404` + `{ error: true, message }`
  - `conflict(res, message)` → `409` + `{ error: true, message }`
  - `error(res, message)` → `500` + `{ error: true, message }`

#### `messages.js`（Back）

- 役割：
  - サーバ側メッセージの SoT。
- 構造：
  - `MSG.ERR_*`, `MSG.INFO_*`, `MSG.WARN_*` 形式の定数をまとめたオブジェクト。
- 例：
  - `MSG.INFO_SAVED`, `MSG.INFO_DELETED`, `MSG.INFO_UNDO_DONE`
  - `MSG.ERR_BAD_REQUEST`, `MSG.ERR_BOOK_NOT_FOUND`, `MSG.ERR_LOG_NOT_FOUND`
  - `MSG.ERR_FORBIDDEN_READONLY`, `MSG.ERR_LINK_FORBIDDEN` 等

#### `validation.js`

- 役割：
  - テキスト/数値の軽量ユーティリティ（リンク検知、必須チェック、正整数化、ISBN形式）。
- 提供関数：
  - `hasLink(str)`：`https?://` または `www.` を含むか判定
  - `isNonEmptyText(str)`：trim後に1文字以上か判定
  - `toPositiveInt(val)`：正の整数なら数値を返し、それ以外は `null`
  - `isValidIsbnOrEmpty(s)`：空は許可、10桁 or 13桁の数字のみ許可（ハイフン不可）

#### `date.js`

- 役割：
  - JST日付（`YYYY-MM-DD`）のバリデーションとユーティリティ。
- 提供関数：
  - `isValidDateJstOrEmpty(s)`：空は許可、形式は `^\d{4}-\d{2}-\d{2}$`
  - `isNotFutureJst(dateStr)`：
    - `dateStrT00:00:00+09:00` を Date 化
    - 現在日時を `Asia/Tokyo` としてローカライズし、JSTの「今日 00:00:00」と比較
    - 未来日でなければ true
  - `normalizeDateJstOrNull(s)`：空なら `null`、それ以外は文字列のまま返す
  - `jstToday()`：JSTの本日（00:00:00）の Date を返す
  - `daysInMonth(year, month)`：指定年月の日数を返す

---

### 2.3 ルーティング層

#### `me.js`

- 役割：
  - デモユーザー情報を返すルータ。
  - `DEMO_USERS`（固定マップ）から `req.demoUser`（文字列）に対応するユーザーを選び、なければ `demo-1` を返す。
- エンドポイント（`app.use('/api/me', meRouter)` 前提）：
  - `GET /api/me`
    - レスポンス：`{ data: { id, name, isReadOnly } }`

#### `books.js`

- 役割：
  - 書籍APIのルーティング定義（Controllerへ委譲）。
- エンドポイント（`app.use('/api/books', booksRouter)` 前提）：
  - `GET /api/books` → `bookController.listBooks`
  - `GET /api/books/:id` → `bookController.getBook`
  - `POST /api/books` → `bookController.createBook`
  - `PATCH /api/books/:id` → `bookController.updateBook`
  - `DELETE /api/books/:id` → `bookController.softDeleteBook`

#### `logs.js`

- 役割：
  - 読書ログAPIのルーティング定義（Controllerへ委譲）。
- エンドポイント（`app.use('/api/books', logsRouter)` 前提）：
  - `GET /api/books/:id/logs` → `logController.listLogs`
  - `POST /api/books/:id/logs` → `logController.createLog`
  - `DELETE /api/books/:id/logs/last` → `logController.deleteLatestLog`
- 補足：
  - ルートパラメータは `:id`（bookId）として扱う。

#### `notes.js`

- 役割：
  - Notesのルーティング定義（booksスコープ / notesスコープを同一Routerで扱う）。
- エンドポイント（`app.use('/api', notesRouter)` 前提）：
  - booksスコープ
    - `GET /api/books/:bookId/notes` → `noteController.listNotes`
    - `POST /api/books/:bookId/notes` → `noteController.createNote`
  - notesスコープ
    - `GET /api/notes/:noteId` → `noteController.getNote`
    - `PATCH /api/notes/:noteId` → `noteController.updateNote`
    - `DELETE /api/notes/:noteId` → `noteController.deleteNote`

#### `stats.js`

- 役割：
  - 統計APIのルーティング定義（Controllerへ委譲）。
- エンドポイント（`app.use('/api', statsRouter)` 前提）：
  - `GET /api/stats/monthly` → `statsController.getMonthlyPages`

#### `health.js`

- 役割：
  - ヘルスチェック用ルータ（疎通確認）。
- エンドポイント（`app.use('/health', healthRouter)` 前提）：
  - `GET /health`
    - レスポンス：`{ ok: true, user: req.demoUser || 'demo-1' }`
    - ※ `http` ヘルパではなく `res.json()` を直接使用。

---

### 2.4 コントローラ層

#### `bookController.js`

- 役割：
  - 書籍の入力バリデーション + Service呼び出し + HTTPレスポンス整形。
- 関数：
  - `createBook(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - 入力（body）：`{ title, total_pages, author, publisher, isbn }`
    - バリデーション：
      - `title` 必須（空NG）
      - `title/author/publisher` はリンク禁止
      - `total_pages` は正整数（`toPositiveInt`）
      - `isbn` は空または 10/13桁の数字のみ
    - 成功：`http.created(res, created)`（messageはデフォルト `INFO_SAVED`）

  - `listBooks(req, res)`
    - クエリ：
      - `state` は `reading|done` のみ採用、それ以外は `null`
      - `keyword` は `trim()` して空なら `null`
    - 成功：`http.ok(res, rows, rows.length ? undefined : MSG.INFO_NO_RESULTS)`

  - `getBook(req, res)`
    - `:id` を数値化し整数でなければ `http.bad(res)`
    - 取得できなければ `http.notFound(res)`（messageはデフォルト）
    - 成功：`http.ok(res, row)`

  - `updateBook(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `:id` 整数チェック
    - 部分更新（`undefined/null` は「未指定」として扱う）：
      - `title`：指定時のみ必須&リンク禁止
      - `author/publisher`：truthy時のみリンク禁止（空文字クリアは許容）
      - `total_pages`：指定時のみ正整数チェック
      - `isbn`：指定時のみフォーマットチェック
    - 取得できなければ `http.notFound(res)`
    - 成功：`http.ok(res, updated, MSG.INFO_SAVED)`

  - `softDeleteBook(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `:id` 整数チェック
    - 対象なし：`http.notFound(res)`
    - 成功：`http.ok(res, { id: row.id }, MSG.INFO_DELETED)`

#### `logController.js`

- 役割：
  - 読書ログの入力バリデーション + Service呼び出し + エラーのHTTP変換。
- 関数：
  - `createLog(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `bookId = Number(req.params.id)`（整数チェック）
    - 入力（body）：`{ cumulative_pages, minutes, date_jst, memo }`
    - バリデーション：
      - `minutes`：指定時のみ「0以上の整数」
      - `date_jst`：形式チェック（空可）+ 指定時は「未来日NG」
      - `memo`：指定時のみリンク禁止 + 最大500文字
    - 成功：`http.created(res, { id: created.log.id, book: created.book }, MSG.INFO_SAVED)`
    - 失敗：
      - Service が `Error(MSG.*)` を投げる前提で message を見て分岐
      - `ERR_NOT_FOUND` → `http.notFound(res, m)`
      - `ERR_LOG_DIFF_ZERO / ERR_LOG_REVERSE / ERR_PAGES_OUT_OF_RANGE / ERR_MINUTES_OUT_OF_RANGE` → `http.bad(res, m)`
      - その他 → `http.error(res, MSG.ERR_INTERNAL)`

  - `listLogs(req, res)`
    - `bookId` 整数チェック
    - クエリ：`limit`/`offset` を数値化（未指定は `50/0`）
    - 成功：`http.ok(res, rows, rows.length ? undefined : MSG.INFO_NO_RESULTS)`

  - `deleteLatestLog(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `bookId` 整数チェック
    - 成功：`http.ok(res, { id: result.log.id, book: result.book }, MSG.INFO_UNDO_DONE)`
    - 失敗：
      - `ERR_NOT_FOUND` → `http.notFound(res, m)`
      - その他 → `http.error(res, MSG.ERR_INTERNAL)`

#### `noteController.js`

- 役割：
  - Notesの入力バリデーション + Service呼び出し + エラーのHTTP変換。
- 関数：
  - `createNote(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `bookId = Number(req.params.bookId)`（整数チェック）
    - 入力（body）：`{ body }`
    - バリデーション：
      - `body` は文字列必須
      - 最大500文字
      - リンク禁止
    - 成功：`http.created(res, { id: created.note.id }, MSG.INFO_SAVED)`
    - 失敗：`ERR_NOT_FOUND` は 404、それ以外は 500

  - `listNotes(req, res)`
    - `bookId` 整数チェック
    - クエリ：`limit`/`offset` を数値化（未指定は `50/0`）
    - 成功：`http.ok(res, rows, rows.length ? undefined : MSG.INFO_NO_RESULTS)`

  - `getNote(req, res)`
    - `noteId` 整数チェック
    - 成功：`http.ok(res, row.note)`
    - 失敗：`ERR_NOT_FOUND` は 404、それ以外は 500

  - `updateNote(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `noteId` 整数チェック
    - 入力（body）：`{ body }`
    - バリデーション：
      - `body` が `undefined` はNG（存在チェック）
      - 文字列
      - 最大500文字
      - リンク禁止
    - 成功：`http.ok(res, updated.note, MSG.INFO_SAVED)`
    - 失敗：`ERR_NOT_FOUND` は 404、それ以外は 500

  - `deleteNote(req, res)`
    - ReadOnly：`http.forbidden(res)`
    - `noteId` 整数チェック
    - 成功：`http.ok(res, { id: result.note.id }, MSG.INFO_DELETED)`
    - 失敗：`ERR_NOT_FOUND` は 404、それ以外は 500

#### `statsController.js`

- 役割：
  - 月次統計の取得（Service呼び出し + エラーのHTTP変換）。
- 関数：
  - `getMonthlyPages(req, res)`
    - 入力（query）：`{ year, month }`（文字列のまま Service に渡す）
    - 成功：`http.ok(res, result)`
    - 失敗：
      - `MSG.ERR_BAD_REQUEST` のみ `http.bad(res, m)`
      - それ以外は `http.error(res, MSG.ERR_INTERNAL)`

---

### 2.5 サービス層

#### `bookService.js`

- 役割：
  - Book に関するビジネスロジック層（ただし多くは Repository への薄い委譲）。
- 関数：
  - `createBook(input)`
    - `bookRepository.createBook(input)` にそのまま委譲。

  - `listBooks(input)`
    - `bookRepository.listBooks(input)` にそのまま委譲。

  - `getBook(input)`
    - `bookRepository.getBook(input)` にそのまま委譲。

  - `updateBook(input)`
    - `id,userId` をキーに `bookRepository.getBook({ id, userId })` で現行データを取得し、存在しなければ `null` を返す（例外は投げない）。
    - 更新値の決定ルール：
      - `undefined`：現行値を採用
      - `""`（空文字）：`null` としてクリア（author/publisher/isbnのみ）
      - それ以外：指定値を採用
    - `updateInput` を **undefined を含まない形** に整形して `bookRepository.updateBook(updateInput)` を呼ぶ。

  - `softDeleteBook(input)`
    - `bookRepository.softDeleteBook(input)` にそのまま委譲。

#### `logService.js`

- 役割：
  - 読書ログの作成/一覧/Undo（直近削除）と、それに伴う **books のカウンタ更新** を担う。
- 関数：
  - `createLog(input)`
    - 入力：`{ bookId, userId, cumulativePages, minutes = 0, dateJst = null, memo = null }`
    - `bookRepository.getBookCounters({ id: bookId, userId })` で現在の書籍状態を取得し、無ければ `throw new Error(MSG.ERR_NOT_FOUND)`。
    - バリデーション：
      - `cumulativePages`：整数、`0 <= cumulativePages <= total_pages`（範囲外は `MSG.ERR_PAGES_OUT_OF_RANGE`）
      - `minutes`：整数、`minutes >= 0`（範囲外は `MSG.ERR_MINUTES_OUT_OF_RANGE`）
      - 増分 `delta = cumulativePages - prevPagesRead`：
        - `delta === 0` → `MSG.ERR_LOG_DIFF_ZERO`
        - `delta < 0` → `MSG.ERR_LOG_REVERSE`
    - `logRepository.createLog(...)` で logs 追加後、`bookRepository.updateBookCounters(...)` で books を更新：
      - `pagesRead`：`Number(cumulativePages)`
      - `minutesTotal`：`(book.minutes_total || 0) + (createdLog.minutes || 0)`
    - 戻り値：`{ log: createdLog, book: updatedBook, deltaPages: delta }`

  - `listLogs(input)`
    - `logRepository.listLogs(input)` にそのまま委譲。

  - `deleteLatestLog(input)`
    - 入力：`{ bookId, userId }`
    - `bookRepository.getBookCounters(...)` で books 存在チェック（無ければ `MSG.ERR_NOT_FOUND`）。
    - `logRepository.deleteLatestLog({ bookId, userId })` で直近1件を削除し、削除できなければ `MSG.ERR_NOT_FOUND`。
    - 削除後のカウンタ算出：
      - `newPagesRead`：`logRepository.getLatestLog(...)` の残存最新ログの `cumulative_pages`（無ければ 0）
      - `newMinutesTotal`：`book.minutes_total - deletedLog.minutes` を 0 未満にならないよう `Math.max(0, ...)`
    - `bookRepository.updateBookCounters(...)` で books を更新し、`{ log: deletedLog, book: updatedBook }` を返す。

#### `noteService.js`

- 役割：
  - Notes の CRUD と、作成時の **books 存在チェック** を担う。
- 関数：
  - `createNote(input)`
    - 入力：`{ bookId, userId, body }`
    - `bookRepository.getBook({ id: bookId, userId })` で books の存在チェック（無ければ `throw new Error(MSG.ERR_NOT_FOUND)`）。
    - `noteRepository.createNote({ bookId, userId, body })` を実行し、戻り値は `{ note: createdNote }`。

  - `listNotes(input)`
    - `noteRepository.listNotes(input)` にそのまま委譲。

  - `getNote(input)`
    - `noteRepository.getNote(input)` の結果が無ければ `MSG.ERR_NOT_FOUND` を throw、あれば `{ note }` を返す。

  - `updateNote(input)`
    - `noteRepository.updateNote(input)` の結果が無ければ `MSG.ERR_NOT_FOUND` を throw、あれば `{ note: updatedNote }` を返す。

  - `deleteNote(input)`
    - `noteRepository.deleteNote(input)` の結果が無ければ `MSG.ERR_NOT_FOUND` を throw、あれば `{ note: deletedNote }` を返す。

#### `statsService.js`

- 役割：
  - 月次統計（合計ページ、平均など）を算出して返す。
- 関数：
  - `getMonthlyPages({ userId, year, month })`
    - `today = jstToday()` を取得し、year/month 未指定の場合は **今月** をデフォルトにする。
      - `y`：`year` が整数なら採用、そうでなければ `today.getFullYear()`
      - `m`：`month` が整数なら採用、そうでなければ `today.getMonth() + 1`
    - 範囲チェック：
      - `1970 <= y <= 2100` かつ `1 <= m <= 12` を満たさなければ `throw new Error(MSG.ERR_BAD_REQUEST)`。
    - `statsRepository.getMonthlyPages({ userId, year: y, month: m })` を呼び、`totalPages` を取得。
    - 平均の分母 `denom`：
      - 今月：`today.getDate()`
      - 過去月：`daysInMonth(y, m)`
    - `avgPerDay`：
      - `Math.round((totalPages / denom) * 10) / 10`（小数第1位で四捨五入）。
    - 戻り値：`{ year: y, month: m, totalPages, avgPerDay, days: denom }`

---

### 2.6 リポジトリ層

各リポジトリは `.sql` ファイルを読み込み、`pool.query` で実行する想定。

#### `bookRepository.js`

- 役割：
  - Books テーブルに対する DB アクセス（生SQL）を担当する Repository。
  - `backend/sql/queries/books` 配下の SQL を `fs.readFileSync` で読み込み、`pool.query()` で実行する。
- SQLの読み込み：
  - `SQL_DIR = backend/sql/queries/books` を基準に、以下を読み込む。
    - `insert_book.sql`
    - `list_books.sql`
    - `get_book.sql`
    - `update_book.sql`
    - `soft_delete_book.sql`
    - `get_book_counters.sql`
    - `update_book_counters.sql`
- 関数：
  - `createBook({ userId, title, totalPages, author, publisher, isbn })`
    - `author/publisher/isbn` は未指定時 `null` に正規化して INSERT。
    - `insert_book.sql` を実行し、作成した book のレコードを返す。

  - `listBooks({ userId, state, keyword })`
    - `state/keyword` は未指定時 `null` としてクエリに渡す。
    - `list_books.sql` を実行し、条件に合う books の配列を返す。

  - `getBook({ id, userId })`
    - `get_book.sql` を実行し、該当があれば1件、なければ `null` を返す。

  - `updateBook({ id, userId, title, totalPages, author, publisher, isbn })`
    - Service 側で **undefined を含まない形に整形済み** という前提でそのまま更新SQLを実行する。
    - `update_book.sql` を実行し、更新後の book を返す（該当なしは `null`）。

  - `softDeleteBook({ id, userId })`
    - `soft_delete_book.sql` により `deleted_at` を設定して論理削除する。
    - RETURNING は `id` のみ。該当なしは `null`。

  - `getBookCounters({ id, userId })`
    - Logs の作成/Undo に必要な最低限の項目（総ページ、pages_read、minutes_total、state 等）を取得する。

  - `updateBookCounters({ id, userId, pagesRead, minutesTotal })`
    - `pages_read` / `minutes_total` を更新し、`pagesRead >= total_pages` の場合は `state='done'` にする。

#### `logRepository.js`

- 役割：
  - reading_logs（読書ログ）に対する DB アクセス（生SQL）を担当する Repository。
  - `backend/sql/queries/logs` 配下の SQL を `fs.readFileSync` で読み込み、`pool.query()` で実行する。
- SQLの読み込み：
  - `SQL_DIR = backend/sql/queries/logs` を基準に、以下を読み込む。
    - `insert_log.sql`
    - `list_logs.sql`
    - `get_latest_log.sql`
    - `delete_latest_log.sql`
- 関数：
  - `createLog({ bookId, userId, cumulativePages, minutes, dateJst, memo })`
    - パラメータ整形：
      - `minutes ?? 0`
      - `dateJst ?? null`
      - `memo ?? null`
    - `insert_log.sql` を実行し、作成した reading_log（1件）を返す（該当なしは `null`）。

  - `listLogs({ bookId, userId, limit = 50, offset = 0 })`
    - `list_logs.sql` を実行し、指定 book のログ一覧を返す（配列）。

  - `getLatestLog({ bookId, userId })`
    - `get_latest_log.sql` を実行し、最新ログ（1件）を返す（なければ `null`）。

  - `deleteLatestLog({ bookId, userId })`
    - `delete_latest_log.sql` を実行し、最新ログを1件削除して削除した行を返す（なければ `null`）。

#### `noteRepository.js`

- 役割：
  - notes（メモ）に対する DB アクセス（生SQL）を担当する Repository。
  - `backend/sql/queries/notes` 配下の SQL を `fs.readFileSync` で読み込み、`pool.query()` で実行する。
- SQLの読み込み：
  - `SQL_DIR = backend/sql/queries/notes` を基準に、以下を読み込む。
    - `insert_note.sql`
    - `list_notes.sql`
    - `get_note.sql`
    - `update_note.sql`
    - `delete_note.sql`
- 関数：
  - `createNote({ bookId, userId, body })`
    - `insert_note.sql` を実行し、作成した note（1件）を返す（なければ `null`）。

  - `listNotes({ bookId, userId, limit = 50, offset = 0 })`
    - `list_notes.sql` を実行し、指定 book の notes 一覧を返す（配列）。

  - `getNote({ noteId, userId })`
    - `get_note.sql` を実行し、該当があれば1件、なければ `null`。

  - `updateNote({ noteId, userId, body })`
    - `update_note.sql` を実行し、更新後の note を返す（該当なしは `null`）。

  - `deleteNote({ noteId, userId })`
    - `delete_note.sql` を実行し、削除した note を返す（該当なしは `null`）。

#### `statsRepository.js`

- 役割：
  - 月次統計（指定年月に読んだページ数合計）に関する DB アクセス（生SQL）を担当する Repository。
  - `backend/sql/queries/stats/get_monthly_pages.sql` を `fs.readFileSync` で読み込み、`pool.query()` で実行する。
- SQLの読み込み：
  - `SQL_DIR = backend/sql/queries/stats`
  - 読み込むSQL：
    - `get_monthly_pages.sql`
- 関数：
  - `getMonthlyPages({ userId, year, month })`
    - `pool.query(q.getMonthlyPages, [userId, year, month])` を実行。
    - 返却は `{ totalPages: Number(rows[0]?.total_pages ?? 0) }`（数値にキャストして返す）。

---

### 2.7 SQL

#### `backend/sql/queries/books/*.sql`（bookRepository関連）

- `insert_book.sql`
  - books に新規登録（`user_id, title, total_pages, author, publisher, isbn`）。
  - `pages_read, minutes_total, state, created_at, updated_at` を含むレコードを RETURNING で返す。

- `list_books.sql`
  - 指定ユーザーの books を一覧取得（`deleted_at IS NULL` のみ）。
  - `state` が指定された場合のみ `state = $2` で絞り込み（未指定は無条件）。
  - `keyword` が指定された場合のみ `title` または `author` の部分一致（ILIKE）で絞り込み。
  - 並び順：
    - `reading` を先頭、`done` を後ろに寄せる。
    - その後 `updated_at DESC`。

- `get_book.sql`
  - `id` と `user_id` で books を1件取得（`deleted_at IS NULL` のみ）。
  - 返す項目は book の詳細一式（title/author/publisher/isbn/pages_read/minutes_total/state 等）。

- `update_book.sql`
  - book の基本情報（title/total_pages/author/publisher/isbn）を更新し `updated_at` を更新。
  - `state` は `pages_read >= total_pages` の場合に `done`、それ以外は `reading` に補正する。
  - 更新後の book レコード一式を RETURNING。

- `soft_delete_book.sql`
  - `deleted_at = NOW()` を設定して論理削除し、`updated_at` も更新する。
  - RETURNING は `id` のみ。

- `get_book_counters.sql`
  - Logs の作成/Undo で必要となる「カウンタ系」中心の項目を取得する（`total_pages, pages_read, minutes_total, state` 等）。

- `update_book_counters.sql`
  - `pages_read` と `minutes_total` を更新し、`pages_read >= total_pages` の場合は `state='done'` にする。
  - `updated_at = NOW()` を更新する。
  - 更新後の book（カウンタ中心の項目）を RETURNING。

#### `backend/sql/queries/logs/*.sql`（logRepository関連）

- `insert_log.sql`
  - reading_logs に新規ログを INSERT。
  - `minutes` は `COALESCE($4, 0)` で未指定時 0 扱い。
  - `date_jst` は
    - `$5` が指定されていれば `::date` として採用
    - 未指定なら `(NOW() AT TIME ZONE 'Asia/Tokyo')::date`（JSTの当日）を採用。
  - INSERT 後に `id, book_id, user_id, cumulative_pages, minutes, date_jst, memo, created_at` を RETURNING。

- `list_logs.sql`
  - 指定 `book_id`・`user_id` の reading_logs を一覧取得。
  - 並び順：
    - `created_at DESC`
    - 同時刻があり得るため `id DESC` を二次ソートに使用。
  - `LIMIT $3 OFFSET $4` でページング。

- `get_latest_log.sql`
  - 指定 `book_id`・`user_id` の reading_logs のうち最新1件を取得。
  - 並び順は `created_at DESC, id DESC`、`LIMIT 1`。
  - 返す項目は `id, book_id, user_id, cumulative_pages, minutes, date_jst, memo, created_at`。

- `delete_latest_log.sql`
  - `latest` で最新1件の `id` を特定し、その行を DELETE する。
  - 並び順の決定は `created_at DESC, id DESC`（最新決定ロジックは `get_latest_log.sql` と同じ）。
  - 削除した行の `id, book_id, user_id, cumulative_pages, minutes, date_jst, memo, created_at` を RETURNING。


#### `backend/sql/queries/notes/*.sql`（noteRepository関連）

- `insert_note.sql`
  - notes に新規メモを INSERT する。
  - `book_id, user_id, body` を保存し、作成した行を RETURNING で返す（`id, book_id, user_id, body, created_at`）。

- `list_notes.sql`
  - 指定 `book_id`・`user_id` の notes を一覧取得する。
  - 並び順：
    - `created_at DESC`
    - 同時刻があり得るため `id DESC` を二次ソートに使用。
  - `LIMIT $3 OFFSET $4` でページング。

- `get_note.sql`
  - `id`（noteId）と `user_id` で notes を1件取得する。
  - 返す項目は `id, book_id, user_id, body, created_at`。

- `update_note.sql`
  - `id`（noteId）と `user_id` を条件に `body` を更新する。
  - 更新後の行を RETURNING（`id, book_id, user_id, body, created_at`）。

- `delete_note.sql`
  - `id`（noteId）と `user_id` を条件に notes を物理削除する。
  - 削除した行を RETURNING（`id, book_id, user_id, body, created_at`）。

#### `backend/sql/queries/stats/*.sql`（statsRepository関連）

- `get_monthly_pages.sql`
  - **user_id($1) の指定年月（$2=year, $3=month）に「読んだページ総数」を算出して返す**。
  - 計算ロジック（book単位→合算）：
    - 対象 books：
      - `books` から `user_id = $1` かつ `deleted_at IS NULL` の書籍を対象とする。
    - 指定月の境界（start/end）を作る：
      - `start_date`：指定年月の1日
      - `end_date`：`start_date + 1 month`（翌月1日）
    - 各 book について、reading_logs から以下を求める：
      - `before_start`：`date_jst < start_date` となるログの `cumulative_pages` の最大値（無ければ 0）
      - `until_end`：`date_jst < end_date` となるログの `cumulative_pages` の最大値（無ければ 0）
    - 月間の読了ページ（bookごと）：
      - `GREATEST(0, until_end - before_start)`（マイナスは 0 扱い）
    - 最終的に全 book 分を `SUM(...)` して `total_pages`（int）として返す。
  - 「指定月の reading_logs の差分」ではなく、**累計（cumulative_pages）の “月初直前の最大” と “月末直前の最大” の差**で算出する方式。

#### マイグレーション & シード

- `0001_init.sql`
  - `users`, `books`, `reading_logs`, `notes` のテーブル定義。
- `0000_reset_all.sql`
  - 全テーブル truncate で初期化。
- `0001_demo_users.sql`〜`0004_demo_notes.sql`
  - デモユーザー／書籍／ログ／メモの投入。
- `migrate.js`
  - マイグレーション用 SQL を適用する Node スクリプト。
- `seed.js`
  - デモ用 SQL を適用する Node スクリプト。

---

## 3. フロントエンド詳細

### 3.1 アプリケーション構成

#### `main.jsx`

- 役割：
  - React アプリの起動エントリ。
  - グローバルな Provider を最上位で組み立てる。
- 主な処理：
  - `createRoot(...).render(...)` で描画開始。
  - ルーティング：`BrowserRouter` を適用。
  - 通知：`ToastProvider` を適用。
  - デモユーザー状態：`MeProvider` を適用。
  - スタイル：`./styles/tailwind.css` を読み込み。

#### `App.jsx`

- 役割：
  - 画面全体の共通レイアウト（ヘッダー＋メイン領域）を定義する最上位コンポーネント。
- 構成：
  - `<Header />` を常設。
  - `<main>` 内で `<AppRoutes />` を描画（ページ切り替え）。
- スタイル：
  - `bg-bg text-text min-h-screen` のベース背景/文字色/最小高などを付与。
  - コンテンツ幅：`container mx-auto max-w-5xl px-4 py-6`。

#### `routes.jsx`

- 役割：
  - React Router のルート定義を集約し、URL→ページコンポーネントの対応を提供する。
- 実装：
  - `useRoutes()` でルート配列を定義し、`AppRoutes()` がそれを返す。
- ルーティング一覧：
  - `/` → `/books` にリダイレクト（`<Navigate ... replace />`）。
  - `/login` → `Login`。
  - `/register` → `Register`。
  - `/books` → `BooksList`。
  - `/books/new` → `BookNew`。
  - `/books/:id` → `BookDetail`。
  - `*` → `NotFound`（フォールバック）。

---

### 3.2 コンテキスト／ライブラリ／ユーティリティ

#### `api.js`

- 役割：
  - `fetch` の薄いラッパ。baseURL、共通ヘッダー、エラーハンドリング、直近 message の保持を担う。
- ベースURL：
  - `VITE_API_BASE_URL` を優先し、未設定時は `http://localhost:3001`。
- ヘッダー：
  - `X-Demo-User` は `localStorage.demoUser` を使用（無ければ `demo-1`）。
  - `Content-Type: application/json` を付与。
- message の扱い：
  - リクエスト開始時に `__lastMessage` を初期化。
  - レスポンスJSONから `json?.message ?? json?.data?.message ?? null` を `__lastMessage` として保持。
  - `api.getLastMessage()` で直近 message を参照可能。
- エラー処理：
  - ネットワーク層（fetch失敗）は `status=0` の `Error` を throw。
  - `!res.ok` または `json?.error` のとき、`__lastMessage`（無ければ `HTTP {status}`）で `Error` を throw（`e.status` と `e.payload` も付与）。
- 成功時：
  - `json?.data ?? null` を返す（呼び出し側は data のみ受け取る）。
- 公開API：
  - `api.get/post/patch/delete`（内部で `request()` を呼ぶ）＋ `getLastMessage()`。

#### `meContext.jsx`

- 役割：
  - 「現在のデモユーザー（me）」の取得・保持・切替を Context として提供する。
- 管理する状態：
  - `me`：`/api/me` の結果（取得失敗時は `null`）。
  - `loading`：取得中フラグ。
- 初期化：
  - 初回マウント時、`localStorage.demoUser` が無ければ `demo-1` をセットしてから `fetchMe()`。
- 関数：
  - `fetchMe()`：`api.get('/api/me')` を呼び `me` を更新（失敗時は `me=null`、警告ログのみ）。
  - `reload()`：`loading=true` → `fetchMe()`。
  - `loginAs(user)`：`localStorage.demoUser=user` → `reload()`（デモユーザー切替）。
- 付加情報：
  - `isReadOnly: !!me?.isReadOnly`（`me` が `null` の間も false）。
- 利用：
  - `useMe()` で Context を参照。

#### `toastContext.js`

- 役割：
  - トースト表示用の Context と、それを取得する `useToast()` フックを定義する。
- 提供：
  - `ToastContext`：`createContext(null)` で作成。
  - `useToast()`：
    - `ToastProvider` 配下以外で呼ばれた場合は例外を投げる（開発時の誤使用検知）。

#### `ToastProvider.jsx`

- 役割：
  - アプリ全体で使えるグローバルトーストを提供する Provider。
- 管理する状態：
  - `toasts`：画面に表示中の `{ id, type, message }` 配列。
- 提供する関数：
  - `showToast({ type='success', message })`
    - `message` が falsy の場合は何もしない。
    - `id` は `${Date.now()}-${Math.random()}` で生成。
    - 自動クローズ：
      - `type === 'error'` は 5000ms
      - それ以外は 3000ms
- 表示：
  - 画面上部に fixed で重ね表示（PCは右寄せ、モバイルは中央寄せ）。
  - 色分け：
    - error：`border-danger-100 bg-danger-50 text-danger-600`
    - success系：`border-primary-100 bg-primary-50 text-primary-600`

#### `messages.js`（Front）

- 役割：
  - **フロントエンド専用**のメッセージ定義。
  - サーバ由来メッセージは重複定義せず、そのまま表示する方針。
- 構造：
  - `MSG.FE.ERR`：フロント側の通信/予期せぬエラー・画面固有エラー・Readonly等。
  - `MSG.FE.ERR.VALID`：クライアント側バリデーション文言（Books/Logs/Notes）。
  - `MSG.FE.UI`：説明文、空状態、プレースホルダ、ローディング文言。
  - `MSG.FE.CONFIRM`：confirmダイアログ文言。
  - `MSG.FE.INFO`：クライアント側のinfo文言。

#### `date.js`（Front）

- 役割：
  - フロントで使用する日付ユーティリティ。
- 関数：
  - `jstToday()`
    - `Asia/Tokyo` の本日を `YYYY-MM-DD` 形式で返す。
  - `formatYmd(date)`
    - `Date` または日付文字列を受け取り `YYYY/MM/DD` に整形して返す。

#### `validation.js`（Front）

- 役割：
  - フロント側フォーム入力のバリデーションと、APIへ送る値の正規化を担当する。
- 依存：
  - `sanitizeInput / hasLink`：`sanitize.js` を使用。
  - メッセージ：`MSG`。
  - 日付：`jstToday()`（未来日チェック）。
- 低レベル関数：
  - `toPositiveInt(value)`：1以上の整数なら number、それ以外は `null`。
  - `normalizeIsbn(value)`：NFKC + ゼロ幅除去 + 数字以外除去で「数字列」に正規化。
  - `isValidIsbnOrEmpty(value)`：空OK、10桁 or 13桁のみOK。
- フォーム単位の関数：
  - `validateBookForm(form)`
    - title 必須、totalPages 必須＆正整数、リンク禁止（title/author/publisher）、ISBN形式チェック。
    - 返却：`{ ok, errors, values }`（`values` は API 用キー `total_pages` などに整形）。
  - `validateLogForm(form, { totalPages } = {})`
    - `cumulativePages`：整数＆0以上＆総ページ以下
    - `minutes`：整数＆0以上（未入力は 0）
    - `dateJst`：`YYYY-MM-DD` 形式＆未来日禁止
    - `memo`：500文字以内＆リンク禁止
    - 返却：`{ ok, errors, values }`（`cumulative_pages` 等に整形）。
  - `validateNoteForm(form)`
    - body 必須、500文字以内、リンク禁止。
    - 返却：`{ ok, errors, values }`。

#### `sanitize.js`

- 役割：
  - 入力サニタイズとリンク検出のユーティリティ。
- 内容：
  - `nfkc(s)`：`normalize('NFKC')` でUnicode正規化。
  - `stripZeroWidth(s)`：ゼロ幅文字を除去。
  - `hasLink(s)`：`https?://` / `ftp://` / `www.` を含むか（大文字小文字無視）。
  - `sanitizeInput(s)`：`nfkc` → `stripZeroWidth` の順で正規化。

#### `tailwind.css`

- 役割：
  - Tailwind の読み込みと、アプリ共通のデザイントークン（CSS変数）・ユーティリティCSSを定義する。
- Tailwind：
  - `@import 'tailwindcss';` を使用。
- トークン定義（`@theme`）：
  - ベース：`bg/bg-surface/...`、`text/text-muted`、`border` 等のカラートークン。
  - primary：`primary-50/100/500/600` を定義。
  - danger：`danger-50/100/500/600` と、`--color-destructive` を定義。
  - 角丸：`--radius: 0.75rem;`（`rounded-(--radius)` で使用）。
- デフォルトテーマ（`:root`）：
  - 淡いブルー基調の `--c-*` を定義し、`@theme` の `--color-*` から参照する。
- 追加CSS：
  - `.container` の max-width を 72rem に調整。
  - `.skeleton-card` の shimmer エフェクト：
    - `::after` に gradient を重ね、`@keyframes shimmer` で横方向に移動。

---

### 3.3 共通コンポーネント

#### `Header.jsx`

- 役割：
  - 画面上部のヘッダー（アプリ名、ナビゲーション、現在ユーザー表示）。
- 依存：
  - `useMe()`（Context）から `me` を取得しユーザー表示に反映。
- ナビゲーション：
  - `NavLink` でアクティブ時のスタイルを切替（`linkActive`）。
  - タブ：
    - `/books`（一覧）
    - `/books/new`（新規書籍）
    - `/login`
    - `/register`
- レスポンシブ：
  - md未満：上段にアプリ名＋ユーザー情報、下段に横スクロールタブ。
  - md以上：左にアプリ名、右にタブ＋ユーザー情報。

#### `Button.jsx`

- 役割：
  - ボタン共通コンポーネント（variant、loading、disabled を統一）。
- Props：
  - `variant`：`primary | ghost | destructive`（デフォルト `primary`）。
  - `loading`：true の間は Spinner を表示し `disabled` 扱い。
  - `disabled`：明示無効化。
- 表示：
  - `loading` のとき `<Spinner />` を先頭に表示（子要素がある場合は `mr-2`）。
- スタイル：
  - `ghost`：surface系＋枠線
  - `destructive`：danger系
  - `primary`：primaryの塗り（`bg-primary-600 text-white`）

#### `Input.jsx`

- 役割：
  - input の共通スタイル適用コンポーネント。
- 特徴：
  - 通常状態：`bg-surface border-border ...`
  - focus：`focus:ring-primary-100 ...`
  - disabled：`disabled:bg-surface-1 disabled:text-muted ...`

#### `Select.jsx`

- 役割：
  - select の共通スタイル適用コンポーネント。
- 特徴：
  - `bg-surface border-border ...` を付与し、`children` をそのまま描画。

#### `Spinner.jsx`

- 役割：ローディング表示用の共通スピナー。
- Props：
  - `className`：外側の `svg` に付与する追加クラス（デフォルト `''`）。
- 実装概要：
  - `animate-spin` で回転。
  - `circle`（薄い輪）＋ `path`（濃い欠けた輪）で表現。

#### `SkeletonCard.jsx`

- 役割：データ取得中に表示するスケルトンカード。
- Props：
  - `variant`：`'list' | 'detail'`（デフォルト `'list'`）。
- 表示：
  - `detail`：情報量の多いカード想定で、見出し/サブ/メタ/バー等のブロックを多めに表示。
  - `list`：一覧用に、タイトル/メタ/進捗バー/補足のブロックを表示。
- アニメーション：
  - 各ブロックに `animate-pulse` を付与（背景は `bg-primary-50`）。

#### `FormFieldError.jsx`

- 役割：フォーム項目のエラーメッセージ表示（message が無ければ何も表示しない）。
- Props：
  - `message`：表示する文字列。

#### `PageLoading.jsx`

- 役割：ページ単位のローディングUI（通常のローディング＋一定時間経過時の「遅延」説明）を提供。
- Props：
  - `variant`：`'list' | 'detail'`（デフォルト `'list'`）。
  - `slowThresholdMs`：slow 表示の閾値（デフォルト 5000ms）。
- 挙動：
  - `slowThresholdMs` 経過後に `slow=true` とし、スピナー＋説明文（`MSG.FE.UI.LOADING.SLOW_BOOT_*`）を表示。
  - 通常のローディング文言（`MSG.FE.UI.LOADING.DEFAULT`）は常に表示。
  - Skeleton の枚数：
    - `detail`：4枚（上段2＋下段2想定）
    - `list`：6枚（2カラム×3行想定）
- レイアウト：
  - `detail`：`grid gap-4 md:grid-cols-2`
  - `list`：`grid grid-cols-1 gap-4 sm:grid-cols-2`

---

### 3.4 書籍関連コンポーネント

#### `BookCard.jsx`

- 役割：書籍一覧の「1冊分カード」表示。タイトル/著者/最終更新/進捗/クイック更新をまとめる。
- Props：
  - `book`：APIの books レコード（`total_pages`, `pages_read`, `minutes_total`, `updated_at` 等）。
  - `onUpdated`：クイック更新保存後に一覧を再取得させるためのコールバック。
- 進捗：
  - `progress = read/total`（total が 0 の場合は 0% ガード）。
  - 進捗バーは `style={{ width: \\${progress}%\ }}`。
- 画面遷移：
  - タイトルは `Link` で `/books/:id` に遷移。
- 内包コンポーネント：
  - `QuickUpdateForm` に `bookId / totalPages / onSaved` を渡して表示。

#### `BookForm.jsx`

- 役割：書籍の新規登録/編集で共通のフォーム（ページ側は「POST/PATCHの実行」だけ意識できる設計）。
- Props：
  - `mode`：`'create' | 'edit'`（デフォルト `'create'`）。
  - `initialValues`：編集時の初期値（title/totalPages/author/publisher/isbn）。
  - `onSubmit(values)`：バリデーション済みの `values`（API用キー：`total_pages` 等）を親へ渡す。
  - `onCancel()`：戻るボタンの動作。
  - `isReadOnly`：true の場合は送信不可＆注意文言を表示。
- バリデーション：
  - `validateBookForm(form)` を使用。
  - blur 時に単項目＋グローバル（`_global`）も更新。
  - ISBN は blur 時に `normalizeIsbn()` で正規化してから検証。
- エラー表示：
  - 項目別 `errors[field]` と、フォーム全体 `errors._global` / `submitError` を表示。
- 送信：
  - ReadOnly は `MSG.FE.ERR.GENERAL_READONLY` を `submitError` にセットして終了。
  - `saving` 中はボタン disabled。送信中は `Button loading` を使用。

#### `QuickUpdateForm.jsx`

- 役割：一覧カード内で「読書ログ（進捗）」を素早く追加するフォーム。
- Props：
  - `bookId`：対象書籍ID。
  - `totalPages`：累計ページ入力の上限チェックに使用。
  - `onSaved()`：保存成功後に親へ通知（一覧再取得など）。
- ReadOnly：
  - `useMe()` の `me.isReadOnly` を参照して送信不可。
- 初期値：
  - `dateJst: jstToday()`（今日）。
- バリデーション：
  - `validateLogForm(form, { totalPages })` を使用。
  - blur 時に単項目＋グローバル（`_global`）を更新。
- API：
  - `POST /api/books/:bookId/logs` に `result.values` を送信。
- Toast：
  - 成功時は `api.getLastMessage()` を `showToast({ type:'success', message })` で表示。

#### `BookNotesSection.jsx`

- 役割：書籍詳細の「メモ」セクション（notes の取得/追加/編集/削除）。
- Props：
  - `bookId`：対象書籍ID。
  - `isReadOnly`：true の場合は追加/編集/削除を抑止し注意文を表示。
- データ取得：
  - `GET /api/books/:bookId/notes` で一覧取得し `notes` に保持。
- 追加：
  - `validateNoteForm(form)` を通した後、`POST /api/books/:bookId/notes`。
  - 成功時：`api.getLastMessage()` を Toast 表示、フォームクリア、再取得。
- 編集：
  - `editingId / editingBody` で行単位編集を管理し、`PATCH /api/notes/:noteId`。
- 削除：
  - `window.confirm(MSG.FE.CONFIRM.DELETE_NOTE)` の後、`DELETE /api/notes/:noteId`。
- 表示：
  - ローディング中は `MSG.FE.UI.LOADING.DEFAULT` を表示。
  - 0件時は `MSG.FE.UI.EMPTY.NOTES`。
  - 下部にリンク禁止の注意（`MSG.FE.UI.NOTE.LINK_NOTICE`）を表示。

#### `SearchBar.jsx`

- 役割：書籍一覧の検索UI（キーワード＋ステータス絞り込み）。
- Props：
  - `keyword`, `onKeywordChange(next)`：キーワード入力の値と更新。
  - `state`, `onStateChange(next)`：ステータス選択値と更新。
- 構成：
  - キーワード：`Input`（placeholder は `MSG.FE.UI.PLACEHOLDER.SEARCH`）。
  - ステータス：`Select`（`reading/done/all`）。

#### `StatsBar.jsx`

- 役割：月次統計の表示＋表示月の切替（type="month"）。
- Props：
  - `ym`：`{ year, month }`（表示対象年月）。
  - `onChangeYm({ year, month })`：月変更時に親へ通知。
- データ取得：
  - `GET /api/stats/monthly?year=...&month=...` を `useEffect` で取得。
  - `cancelled` フラグで「古いリクエスト結果による上書き」を防止。
- 表示分岐：
  - loading：`MSG.FE.UI.LOADING.STATS`。
  - error：`err.message` 優先、なければ `MSG.FE.ERR.NETWORK`。
  - hasPages：`合計 {totalPages} ページ／1日平均 {avgPerDay} ページ`。
  - 0ページ：`MSG.FE.UI.EMPTY.STATS`。
- 入力制限：
  - `max` は `formatYmd(jstToday()).slice(0, 7)` で「今月まで」に制限。

---

### 3.5 ページコンポーネント

- `Login.jsx`
  - デモユーザー選択画面。
  - Select で `demo-1` などを選び、ログインボタンで `meContext` を更新。

- `Register.jsx`
  - 「本アプリでは新規登録できない」旨の説明のみ表示。

- `BooksList.jsx`
  - 書籍一覧画面。
  - 構成：
    - 検索バー（`SearchBar`）
    - 状態フィルタ（`SearchBar`（Select））
    - 統計バー（`StatsBar`）
    - 一覧領域：
      - ローディング中：SkeletonCard＋ローディング文言。
      - エラー：エラー枠＋メッセージ。
      - データ有：BookCard のグリッド。
  - データ取得：
    - 初回マウントで `/api/books`, `/api/stats/monthly` を並行取得。
    - 取得開始から5秒以上経過したらスピナー＋専用文言を表示。

- `BookNew.jsx`
  - 新規書籍登録画面。
  - 内部で `BookForm` を利用。
  - 登録成功時に一覧へ遷移し、トースト表示。

- `BookDetail.jsx`
  - 詳細画面。レイアウトは **2行×2カラムのグリッド**。
  - 上段左：書籍情報カード（`BookForm` 埋め込み編集／削除ボタン）。
  - 上段右：進捗入力カード（`QuickUpdateForm`）。
  - 下段左：メモカード（`BookNotesSection`）。
  - 下段右：ログ履歴カード（ログ一覧＋直前ログUndoボタン）。
  - ローディング：
    - 初回読み込み中は Skeleton＋ローディング文言。
    - 一定時間以上の場合はスピナー＋専用文言を表示。
  - 読み取り専用ユーザー時は書込み系 UI を disable。

- `NotFound.jsx`
  - 存在しないパス時に表示。
  - `/books` へのリンクを配置。

---

## 4. バリデーション詳細（サーバ／フロント）

### 4.1 共通方針

- すべてのテキスト入力に対して：
  - NFKC 正規化。
  - ゼロ幅スペース等の削除。
  - URL/リンク検知を適用。
- サーバ側は **最終的な権威** として必ずバリデーションを実施。
- フロント側はユーザー体験のために「同等のルールを先に表示する」位置づけ。

### 4.2 書籍（Books）

- title
  - 必須、1〜200文字程度。
- totalPages
  - 必須、1以上の整数。
- author, publisher
  - 任意、0〜120文字程度、リンク禁止。
- isbn
  - 任意。
  - 10桁または13桁の数字のみ（ハイフン不可）。

### 4.3 読書ログ（Reading Logs）

- cumulativePages
  - 必須、0以上の整数。
  - 直前ログの値より大きくない場合はエラー。
- minutes
  - 0以上の整数。**NULL不可（default 0）**。
- memo
  - 任意、最大300文字程度。
- dateJst
  - 必須（日付の指定がなければ内部で当日扱い）。
  - 日本時間基準で「今日より未来でない」こと。

### 4.4 Notes

- body
  - 必須、1〜500文字程度。
  - リンク禁止。

---

## 5. ローディング／エラー体験詳細

### 5.1 一覧画面（BooksList）

- 初回ロード：
  - 一覧領域に SkeletonCard を複数表示。
  - 上部に「読み込み中...」のメッセージ。
- 5秒以上レスポンスがない場合：
  - 「初回アクセス時はサーバ起動に時間がかかる場合があります」
  - 「画面を閉じずにお待ちください」
  - 大きめの Spinner。
- エラー：
  - `err.message`（サーバ由来）を優先表示。
  - なければ `MSG.FE.ERR.NETWORK` を表示。

### 5.2 詳細画面（BookDetail）

- 初回ロード：
  - 書籍情報・ログ・メモにそれぞれ Skeleton もしくはプレースホルダを表示。
- 5秒以上レスポンスがない場合：
  - 「初回アクセス時はサーバ起動に時間がかかる場合があります」
  - 「画面を閉じずにお待ちください」
  - 大きめの Spinner。
- 保存／更新／削除／Undo：
  - ボタン内に Spinner を表示。
  - 成功時：`api.getLastMessage()` をトーストで表示。
  - エラー時：`err.message` をカード内に表示。

---

## 6. 環境変数・設定

### 6.1 Backend (Render)

- `PORT`
- `DATABASE_URL_POOLED`
- `FRONTEND_ORIGIN`
- `NODE_ENV`

### 6.2 Frontend (Vercel)

- `VITE_API_BASE_URL`
- その他、必要に応じた公開可能な値のみ。

### 6.3 SPAルーティング設定

- Vercel 側で `/books/*` などを `index.html` にフォールバックする設定を行う。
- これにより、任意の画面でリロードしても 404 にならず、SPA が復元される。

---

## 7. 手動テスト観点（簡易）

- 書籍の新規登録→一覧反映→詳細編集→削除（ソフトデリート）。
- ログの追加：
  - 累計入力→差分＋Nページ表示。
  - 読了に達した際に状態が `done` になること。
- 直前ログの Undo：
  - ログが削除され、`pages_read`／`minutes_total` が巻き戻ること。
- メモの追加／編集／削除：
  - 本文バリデーション・リンク禁止が機能していること。
- 統計：
  - 今月／過去月を切り替えて数値が変わること。
- 読み取り専用ユーザー：
  - 書込み系 UI が disable。
  - 書込み API が 403 を返す。
- コールドスタート：
  - 初回アクセスでローディング表示→一定時間後に「サーバ起動中」の説明が出ること。
  - 起動完了後に一覧が正常に表示されること。
