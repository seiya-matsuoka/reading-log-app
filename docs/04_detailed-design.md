# 読書記録アプリ｜詳細設計（実装版）

> 前提：JavaScriptのみ（TypeScript不使用）。分離構成：Frontend（Vite + React｜Vercel静的）／Backend（Express｜Render常駐）／DB（Vercel Postgres｜生SQL）。
> 目的：実装前の最終整理。迷いなく着手でき、完成時の網羅チェックにも使える粒度で定義。

---

## 1. リポジトリ構成（モノレポ）
```
reading-log-app/
├─ README.md
├─ .gitignore
├─ .nvmrc                        # Nodeバージョン固定（例: v20.x）
├─ docs/                         # 設計書（本ファイルなど）
├─ backend/
│  ├─ package.json
│  ├─ src/
│  │  ├─ index.js               # 起動エントリ（listen）
│  │  ├─ app.js                 # Expressインスタンス生成・共通MW
│  │  ├─ routes/
│  │  │  ├─ me.js
│  │  │  ├─ books.js            # /api/books, /api/books/:id
│  │  │  ├─ logs.js             # /api/books/:id/logs, /api/logs/:logId
│  │  │  ├─ notes.js            # /api/books/:id/notes, /api/notes/:noteId
│  │  │  └─ stats.js            # /api/stats
│  │  ├─ controllers/
│  │  │  ├─ meController.js
│  │  │  ├─ bookController.js
│  │  │  ├─ logController.js
│  │  │  ├─ noteController.js
│  │  │  └─ statsController.js
│  │  ├─ services/
│  │  │  ├─ bookService.js      # 累計→差分計算・状態自動遷移
│  │  │  ├─ logService.js       # 直前ログUndo、巻き戻し
│  │  │  ├─ noteService.js
│  │  │  └─ statsService.js
│  │  ├─ repositories/
│  │  │  ├─ bookRepository.js
│  │  │  ├─ logRepository.js
│  │  │  ├─ noteRepository.js
│  │  │  └─ userRepository.js
│  │  ├─ db/
│  │  │  ├─ pool.js             # pg Pool生成（pooled接続文字列）
│  │  │  └─ tx.js               # トランザクションヘルパ（任意）
│  │  ├─ middleware/
│  │  │  ├─ cors.js
│  │  │  ├─ demoUser.js         # X-Demo-Userの解決（初回はdemo-1固定）
│  │  │  ├─ readonlyGuard.js    # 書込み系で読み取り専用を403に
│  │  │  └─ errorHandler.js     # 例外→{messageId}で整形
│  │  ├─ utils/
│  │  │  ├─ validate.js         # NFKC・リンク禁止・範囲チェック
│  │  │  ├─ messages.js         # messageId定義（Back側参照用）
│  │  │  └─ date.js             # JST解釈/UTC保存補助（必要なら）
│  │  └─ config/
│  │     └─ env.js              # 環境変数読取（DATABASE_URL_POOLED等）
│  └─ sql/
│     ├─ migrations/
│     │  ├─ 0001_init.sql
│     │  └─ 0002_indexes.sql
│     └─ queries/
│        ├─ books/
│        │  ├─ insert_book.sql
│        │  ├─ get_book_by_id.sql
│        │  ├─ list_books_by_user.sql
│        │  ├─ update_book.sql
│        │  └─ soft_delete_book.sql
│        ├─ logs/
│        │  ├─ insert_log.sql
│        │  ├─ list_logs_by_book.sql
│        │  └─ delete_log_by_id.sql
│        ├─ notes/
│        │  ├─ insert_note.sql
│        │  ├─ list_notes_by_book.sql
│        │  └─ delete_note_by_id.sql
│        └─ stats/
│           └─ monthly_pages.sql
└─ frontend/
   ├─ package.json
   ├─ index.html
   ├─ vite.config.js
   ├─ postcss.config.js
   ├─ tailwind.config.js
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ routes.jsx              # React Router定義
      ├─ pages/
      │  ├─ Login.jsx
      │  ├─ Register.jsx
      │  ├─ BooksList.jsx
      │  ├─ BookNew.jsx
      │  └─ BookDetail.jsx
      ├─ components/
      │  ├─ common/
      │  │  ├─ Header.jsx
      │  │  ├─ Button.jsx
      │  │  ├─ Input.jsx
      │  │  ├─ Select.jsx
      │  │  ├─ Spinner.jsx
      │  │  ├─ SkeletonCard.jsx
      │  │  └─ FormFieldError.jsx
      │  └─ books/
      │     ├─ BookCard.jsx
      │     ├─ QuickUpdateForm.jsx
      │     ├─ SearchBar.jsx
      │     └─ StatsBar.jsx
      ├─ lib/
      │  └─ api.js               # fetch薄ラッパ
      ├─ messages/
      │  └─ messages.json        # messageId→日本語
      ├─ utils/
      │  ├─ date.js              # JST表示、YYYY/MM/DD
      │  └─ sanitize.js          # NFKC/ゼロ幅除去/URL検知
      └─ styles/
         └─ tailwind.css
```

### 役割と責務（要約）
- **backend/src/routes**：HTTPルート宣言（メソッド×パス→controller）。
- **controllers**：`req/res`を扱う境界。DTO整形・ステータス決定。
- **services**：業務ロジック（累計→差分計算、状態自動遷移、Undo制御）。
- **repositories**：`.sql`読込＋`pg`実行（パラメタバインド）。
- **db**：接続プール・トランザクション。
- **middleware**：CORS、デモユーザー解決、読み取り専用ガード、エラー整形。
- **frontend/pages**：画面本体。URL毎の入出力。
- **components/common**：汎用UI部品（ボタン、入力、ローダー等）。
- **components/books**：ドメイン特化UI（カード、検索、統計バー等）。
- **lib/api.js**：API薄ラッパ（baseURL、`X-Demo-User`、`messageId`ハンドリング）。
- **messages/messages.json**：文言一元管理（Backは`messageId`のみ返す）。

---

## 2. 実装順序（推奨）
1) **リポジトリ初期化**：モノレポ作成、`.nvmrc`、`README`。
2) **Backend基盤**：`app.js`（CORS/JSON/error）、`pool.js`、環境変数、`/api/me` 仮実装。
3) **マイグレーション**：`0001_init.sql` 作成→適用、デモユーザー投入（seed）。
4) **Books（最小）**：作成／取得／一覧／更新（基本情報）／ソフト削除。
5) **Logs**：累計入力→差分計算、Undo（直前のみ）。Booksのカウンタ更新と状態自動遷移を同一Txで実装。
6) **Notes**：書籍詳細へのメモのみ登録／削除／一覧。
7) **Stats**：月次（今月＋過去月）返却。
8) **Frontend基盤**：Vite + React、Router、Header、`lib/api.js`、`messages.json`、`utils/date.js`。
9) **画面実装**：
   - `/login`（切替UI）→`/books`（一覧＋クイック更新）→`/books/new`→`/books/:id`（詳細・履歴・メモ）
10) **ローディング/エラー体験**：一覧スケルトン、ボタンスピナー、インラインエラー。
11) **最終調整**：JST境界の統計確認、読み取り専用のUI制御、デモ注意文言。

---

## 3. ルーティング & エンドポイント（洗い出し）
- **セッション/ユーザー**
  - `GET /api/me` … { id, name, isReadOnly }
- **書籍（Books）**
  - `GET /api/books?q=&state=reading|done&limit=&offset=`
  - `POST /api/books` … { title, totalPages, author?, publisher?, isbn?, note? }
  - `GET /api/books/:id`
  - `PATCH /api/books/:id` … { title?, totalPages?, author?, publisher?, isbn?, note? }
  - `DELETE /api/books/:id` … ソフトデリート（deleted_at）
- **読書ログ（Reading Logs）**
  - `GET /api/books/:id/logs?limit=&offset=`
  - `POST /api/books/:id/logs` … { dateJst, cumulativePages, minutes?, memo? }
  - `DELETE /api/logs/:logId` … 直前ログのUndo用（サービス側で厳密判定）
- **メモ（Notes）**
  - `GET /api/books/:id/notes?limit=&offset=`
  - `POST /api/books/:id/notes` … { body }
  - `DELETE /api/notes/:noteId`
- **統計（Stats）**
  - `GET /api/stats/monthly?year=YYYY&month=MM` … { totalPages, avgPerDay }

> ステータスコードは最小限（200/201/204/400/403/404/409/500）。レスポンス骨子：`{ data, error, messageId }`。

---

## 4. 生SQL（.sql）洗い出し（機能→クエリ）
### 4.1 migrations
- `0001_init.sql` … テーブル：`users`, `books`, `reading_logs`, `notes`（FK制約、NOT NULL、デフォルト、インデックス最小）
- `0002_indexes.sql` … 需要に応じて `books(user_id,state,updated_at)`, `LOWER(title)`, `LOWER(author)` 等

### 4.2 books（repositories/books）
- `insert_book.sql` … 新規作成（重複警告用に同名・同著者の存在チェックはサービス側）
- `get_book_by_id.sql` … 詳細取得（deleted_at IS NULL）
- `list_books_by_user.sql` … 検索（q: title/author部分一致・lower）、stateフィルタ、更新降順
- `update_book.sql` … 基本情報更新（isbnは数字のみ）
- `soft_delete_book.sql` … deleted_atに現在時刻を設定
- （任意）`update_book_counters.sql` … pages_read・minutes_total・state をまとめて更新（Tx内で使用）

### 4.3 reading_logs（repositories/logs）
- `insert_log.sql` … {book_id,user_id,date_jst,cumulative_pages,minutes?,memo?}
- `list_logs_by_book.sql` … 時系列降順（created_at DESC）
- `delete_log_by_id.sql` … 直前ログの削除（Tx内でbook再計算）
- （任意）`recalc_book_from_logs.sql` … logs集約→booksへ反映（巻き戻し/再集計に使用）

### 4.4 notes（repositories/notes）
- `insert_note.sql` … 書籍詳細へのメモ追加
- `list_notes_by_book.sql` … 作成日時降順
- `delete_note_by_id.sql`

### 4.5 stats（repositories/stats）
- `monthly_pages.sql` … JSTで月境界を切って `delta` 合算と平均（日数割り）

> すべて**パラメタ化（$1, $2, ...）**でSQLインジェクション対策。必要に応じ**Txで一貫更新**。

---

## 5. ビジネスルール（コア）
- **状態自動判定**：`pages_read >= total_pages` → `done`、未満→`reading`。手動変更不可。
- **ログ登録（累計入力）**：前回 `cumulative_pages` と比較し `delta = 新 - 旧` を算出。`delta <= 0` はエラー（`messageId=ERR_CUMULATIVE_NOT_INCREASED`）。`pages_read = min(total_pages, cumulative)`／`minutes_total += minutes||0` を更新。
- **Undo**：**常に最新1件のみ**を対象。1回実行ごとに“最新”が更新されるため**連続Undo可**。削除後は `pages_read` / `minutes_total` を巻き戻し（または再集計）。

---

## 6. フロントのコンポーネント構成
### 5.1 画面単位
- **Login.jsx** … デモユーザー選択（初期はdemo-1）、注意書き
- **Register.jsx** … 登録不可の説明のみ
- **BooksList.jsx** … 検索/フィルタ、統計バー、カード一覧、クイック更新（累計→＋N表示）
- **BookNew.jsx** … 新規登録フォーム（インラインエラー）
- **BookDetail.jsx** … 基本情報、進捗（%・ページ・累計時間）、ログ履歴、メモ履歴、メモ追加、直前ログUndo

### 5.2 コンポーネント
- **common/**
  - `Header.jsx`（ナビ）
  - `Button.jsx`, `Input.jsx`, `Select.jsx`
  - `Spinner.jsx`（ボタン内）
  - `SkeletonCard.jsx`（一覧初回ロード）
  - `FormFieldError.jsx`（各項目の直下エラー表示）
- **books/**
  - `BookCard.jsx`（タイトル/著者/進捗バー/累計時間/最終更新）
  - `QuickUpdateForm.jsx`（累計読了ページ・時間・短メモ→POST）
  - `SearchBar.jsx`（q, state）
  - `StatsBar.jsx`（今月＋過去月選択）

### 5.3 共通処理
- **lib/api.js** … fetch薄ラッパ：`get/post/patch/delete(path, body)`／`X-Demo-User` ヘッダ付与／`messageId`→throw or返却
- **messages/messages.json** … UI文言（空状態、注意、成功/失敗、バリデーション）
- **utils/date.js** … JST→表示`YYYY/MM/DD`
- **utils/sanitize.js** … NFKC/ゼロ幅除去/URL検知（リンク禁止）

---

## 6. 入力・エラー表示ルール（UI）
- **バリデーション表示**：**submit時 + first blur時**。フィールド特定できるエラーは**直下に**、全体エラーは**フォーム上部**に短文。
- **ローディング**：一覧初回は**スケルトン**（または上部ローダー）、保存/更新は**ボタン内スピナー**。
- **読み取り専用ユーザー**：書込みUIは無効化（ボタンdisabled/非表示）＋説明文。

---

## 7. 基本フロー（図・テキスト）
### 7.1 初回ロード（一覧）
```
[ユーザー] → /books にアクセス
  → [Front] スケルトン表示 / api.get('/api/me') / api.get('/api/books') / api.get('/api/stats/monthly')
  → [Back] CORS許可 / X-Demo-User 解決 / DB参照
  → [Front] スケルトン解除→カード描画、統計表示
```

### 7.2 クイック更新（累計入力→差分計算）
```
[ユーザー] 累計読了ページ(=現在)を入力 + 任意で時間/メモ → 保存
  → [Front] ボタンスピナー / api.post('/api/books/:id/logs', {cumulativePages,...})
  → [Back] 直近累計との差分delta計算 → 書込みTx（logs insert → booksカウンタ更新 → state自動判定）
  → [Front] 成功メッセージ → カード再描画（＋Nページ表示）
```

### 7.3 直前ログのUndo
```
[ユーザー] Undo → api.delete('/api/logs/:logId')
  → [Back] Tx（log削除 → books再集計or巻戻し）
  → [Front] 成功メッセージ → 再描画
```

### 7.4 月次統計（JST）
```
[ユーザー] 月を選択 → api.get('/api/stats/monthly?year&month')
  → [Back] JST境界でdelta合算・平均算出
  → [Front] 値更新
```

---

## 8. CORS・セキュリティ・環境変数
- **CORS**：`FRONTEND_ORIGIN`のみ許可。`OPTIONS`を共通MWで応答。`Access-Control-Allow-Headers: X-Demo-User, Content-Type`。
- **入力ガード**：全入力でリンク禁止（`://`, `www.`, 短縮ドメイン）＋NFKC＋ゼロ幅除去。XSSはテキストエスケープ。
- **環境変数**：
  - **Backend(Render)**：`DATABASE_URL_POOLED`, `FRONTEND_ORIGIN`, `NODE_ENV`
  - **Frontend(Vercel)**：`VITE_API_BASE_URL`（公開可の値のみ）
- **リージョン**：Vercel Postgres=APAC(Singapore)／Render=Singapore

---

## 9. テスト・運用
- **ログ出力**：**行わない**（console含む）。
- **テスト**：手動E2Eのみ（ユニットテストは実施しない）。
- **シード**：コマンド実行（UIなし）。`seed:reset`=truncate→insert を想定。

---

## 9.1 メッセージID最小セット（決定）
- **成功系**
  - `INFO_SAVED`：保存しました。
  - `INFO_DELETED`：削除しました。
  - `INFO_UNDO_DONE`：直前の記録を取り消しました。
  - `INFO_READONLY_USER`：このユーザーは読み取り専用です。
  - `INFO_NO_RESULTS`：該当するデータがありません。
- **警告系**
  - `WARN_DUPLICATE_BOOK`：同名・同著者の書籍がすでに登録されています（登録は可能です）。
- **エラー系（入力/業務）**
  - `ERR_TITLE_REQUIRED`：書籍名を入力してください。
  - `ERR_TOTAL_PAGES_RANGE`：総ページ数は1以上の数値で入力してください。
  - `ERR_ISBN_FORMAT`：ISBNは10桁または13桁の数字で入力してください（ハイフン不要）。
  - `ERR_LINK_FORBIDDEN`：リンクやURLは入力できません。
  - `ERR_FUTURE_DATE`：未来の日付は指定できません。
  - `ERR_CUMULATIVE_NOT_INCREASED`：読了ページの累計は前回より大きい値を入力してください。
  - `ERR_MINUTES_RANGE`：読書時間は0以上の整数で入力してください。
  - `ERR_NOTE_LENGTH`：メモが長すぎます。
  - `ERR_BOOK_NOT_FOUND`：書籍が見つかりません。
  - `ERR_LOG_NOT_FOUND`：読書ログが見つかりません。
  - `ERR_NOTE_NOT_FOUND`：メモが見つかりません。
  - `ERR_FORBIDDEN_READONLY`：読み取り専用ユーザーは変更できません。
  - `ERR_BAD_REQUEST`：入力内容を確認してください。
  - `ERR_RATE_LIMITED`：短時間に操作が集中しています。しばらくしてからお試しください。
  - `ERR_INTERNAL`：エラーが発生しました。時間をおいて再度お試しください。


