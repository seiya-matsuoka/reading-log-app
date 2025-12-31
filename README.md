# 読書記録アプリ（reading-log-app）

<p>
  <a href="https://reading-log-app-frontend.vercel.app/">
    <img alt="Demo" src="https://img.shields.io/badge/demo-Vercel-000000?logo=vercel">
  </a>
</p>

<p>
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES202x-F7DF1E?logo=javascript&logoColor=000000">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5%2B-646CFF?logo=vite&logoColor=ffffff">
  <img alt="React" src="https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=000000">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-4%2B-06B6D4?logo=tailwindcss&logoColor=ffffff">
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel&logoColor=ffffff">
</p>
<p>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=ffffff">
  <img alt="Express" src="https://img.shields.io/badge/Express-REST-000000?logo=express&logoColor=ffffff">
  <img alt="Vercel Postgres" src="https://img.shields.io/badge/Vercel%20Postgres-DB-000000?logo=vercel&logoColor=ffffff">
  <img alt="Render" src="https://img.shields.io/badge/Render-Backend-46E3B7?logo=render&logoColor=000000">
</p>

読書中の書籍を登録し、**累計ページ**をベースに読書ログを追加して進捗管理できるアプリです。  
メモ（Notes）や月次統計（Stats）にも対応しています。

> 本アプリは **デモ運用**を前提としており、認証は行いません（デモユーザー切替方式）。

---

## デモURL

[![Open Demo](https://img.shields.io/badge/demo-Vercel-000000?logo=vercel)](https://reading-log-app-frontend.vercel.app/)

- [`アプリURL`](https://reading-log-app-frontend.vercel.app/)（Vercel）：`https://reading-log-app-frontend.vercel.app/`

- [`バックエンドのヘルスチェック`](https://reading-log-app-backend.onrender.com/health)（Render）

> Render の環境では、一定時間アクセスがないと **コールドスタート**が発生し、初回表示に時間がかかる場合があります。  
> 本アプリでは「サーバ起動待ちの可能性」をローディングUI上で説明表示します。

---

## スクリーンショット

1. ログイン（デモユーザー選択）  
   ![Login](docs/assets/screenshots/01-login.png)

2. 書籍一覧（検索・絞り込み / 統計表示）  
   ![Books List](docs/assets/screenshots/02-books-list.png)

3. 書籍新規登録  
   ![Book New](docs/assets/screenshots/03-book-new.png)

4. 書籍詳細（編集 / 進捗追加 / 直近ログ削除 / メモ / ログ履歴）  
   ![Book Detail](docs/assets/screenshots/04-book-detail.png)

5. ローディング（サーバ起動待ちの説明表示）  
   ![Slow Loading](docs/assets/screenshots/05-loading-slow.png)

---

## できること

- 書籍の登録 / 編集 / 論理削除
- 読書ログの追加（累計ページ・読書時間・日付・メモ）
- 直近ログの取り消し
- メモの追加 / 編集 / 削除
- 月次統計（合計ページ / 1日平均）
- ローディング・エラー体験の整備（コールドスタート考慮）

---

## 技術スタック

- Frontend: JavaScript / Vite / React / Tailwind CSS
- Backend: JavaScript / Node.js / Express
- DB: Vercel Postgres
- Data Access: ORM を使わず 生SQL + Repository構成
- Hosting：Vercel（FE）/ Render（BE）

---

## アプリの特徴

- **生SQL + Repository 構成**で責務分離
- **サーバ／フロントの二段バリデーション**
- 読書ログの **Undo（直近ログ削除）** と、それに伴う集計値の整合性維持
- Render コールドスタートを前提にした **段階的ローディングUI**（一定時間経過で説明を追加）
- デモ運用のため、ユーザー識別は **`X-Demo-User` ヘッダ**で実現（ログイン画面で切替）

---

## REST API

> 詳しい仕様は `/docs` を参照してください。
> - 基本設計（3. REST API（Back））：[`docs/03_basic-design.md 3. REST API（Back）`](docs/03_basic-design.md#3-rest-apiback)
> - 詳細設計（2.3 ルーティング層）：[`docs/04_detailed-design.md 2.3 ルーティング層`](docs/04_detailed-design.md#23-ルーティング層)

- `GET /health`
- `GET /api/me`
- Books
  - `GET /api/books`
  - `POST /api/books`
  - `GET /api/books/:id`
  - `PATCH /api/books/:id`
  - `DELETE /api/books/:id`（論理削除）
- Logs
  - `GET /api/books/:id/logs`
  - `POST /api/books/:id/logs`
  - `DELETE /api/books/:id/logs/last`（直近ログ削除）
- Notes
  - `GET /api/books/:id/notes`
  - `POST /api/books/:id/notes`
  - `GET /api/notes/:noteId`
  - `PATCH /api/notes/:noteId`
  - `DELETE /api/notes/:noteId`
- Stats
  - `GET /api/stats/monthly?year=YYYY&month=MM`

---

## 使い方（最小）

- `/login` でデモユーザーを選択して利用します（`demo-1` など）
- 書籍を登録すると一覧に表示され、タイトルから詳細へ遷移できます
- 詳細または一覧カードから読書ログ（累計ページ）を追加できます
- 直近のログは「直近ログ削除」で取り消し可能です
- ReadOnly ユーザーでは追加・更新・削除ができません（UI抑止＋サーバ側でも拒否）

---

## ローカル起動手順

> コマンドは各 `package.json` の `scripts` を正とします。

### 環境変数（.env）

- **backend/.env**
  - `DATABASE_URL_POOLED`：Vercel Postgres 用接続文字列
  - `FRONTEND_ORIGIN`：CORS 許可するフロント URL（例：`http://localhost:5173`）
  - `NODE_ENV`：`development` / `production`
- **frontend/.env**
  - `VITE_API_BASE_URL`：バックエンド API のベース URL（例：`http://localhost:3001` または Render のURL）

### Backend（Express）

```bash
cd backend
npm install

# 開発起動
npm run dev
```

### マイグレーション / シード

```bash
# マイグレーション
npm run db:migrate

# シード
npm run db:seed

# まとめて実行（migrate → seed）
npm run db:setup
```

> DB は Vercel Postgres を利用する想定です。接続情報（`DATABASE_URL_POOLED`）は `backend/.env` に設定してください。

### Frontend（Vite + React）

```bash
cd frontend
npm install

# 開発起動
npm run dev
```

---

## ディレクトリ構成（概要）

> README では一次情報（概要）のみ記載します。  
> **完全版のツリー・各ファイルの役割は「詳細設計」のリポジトリ構成を参照してください。**  
> - 詳細設計（1. リポジトリ構成（実装版））：[`docs/04_detailed-design.md 1. リポジトリ構成（実装版）`](docs/04_detailed-design.md#1-リポジトリ構成実装版)
> - 詳細設計（2. バックエンド詳細）：[`docs/04_detailed-design.md 2. バックエンド詳細`](docs/04_detailed-design.md#2-バックエンド詳細)
> - 詳細設計（3. フロントエンド詳細）：[`docs/04_detailed-design.md 3. フロントエンド詳細`](docs/04_detailed-design.md#3-フロントエンド詳細)

```bash
.
├─ backend/   # Express API（Repository + 生SQL）
├─ frontend/  # Vite + React SPA
└─ docs/      # 設計ドキュメント一式
```

---

## 設計ドキュメント

設計ドキュメントは `/docs` にまとめています（README は概要のみ）。

- 索引：[`docs/00_docs-index.md`](docs/00_docs-index.md)
- 仕様まとめ：[`docs/01_spec-summary.md`](docs/01_spec-summary.md)
- 企画・要件定義：[`docs/02_requirements.md`](docs/02_requirements.md)
- 基本設計：[`docs/03_basic-design.md`](docs/03_basic-design.md)
- 詳細設計：[`docs/04_detail-design.md`](docs/04_detailed-design.md)

---

## 補足

- 本番環境では、SPA ルーティング（URL直打ち/リロード）に対応する設定を追加しています（Vercel側）。
- デモ用途のため、実ユーザー登録・認証機構はありません。
