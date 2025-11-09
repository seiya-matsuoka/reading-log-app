import express from 'express';

import cors from './middleware/cors.js';
import demoUser from './middleware/demoUser.js';
import { readonlyGuard } from './middleware/readonlyGuard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { http } from './utils/http.js';

import healthRouter from './routes/health.js';
import meRouter from './routes/me.js';
import booksRouter from './routes/books.js';
import logsRouter from './routes/logs.js';
import notesRouter from './routes/notes.js';

const app = express();

app.use(express.json());
app.use(cors);

// デモユーザ（req.demoUser と req.isReadOnly を付与）
app.use(demoUser);

// ReadOnly ユーザーは書き込み系メソッドを 403 エラーにする
app.use(readonlyGuard);

// 疎通確認用ルート
app.use('/health', healthRouter);

app.use('/api/me', meRouter);

app.use('/api/books', booksRouter);
app.use('/api/books', logsRouter);

// Router で books or notes スコープに分岐する
app.use('/api', notesRouter);

// 404 ハンドリング
app.use((req, res) => http.notFound(res));

// 最終エラーハンドリング(4xx/5xx に正規化して返却)
app.use(errorHandler);

export default app;
