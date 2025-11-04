import express from 'express';
import cors from './middleware/cors.js';
import demoUser from './middleware/demoUser.js';
import healthRouter from './routes/health.js';

const app = express();

app.use(express.json());
app.use(cors);

// デモユーザ
app.use(demoUser);

// 疎通確認用ルート
app.use('/health', healthRouter);

// 404 ハンドリング
app.use((req, res) => res.status(404).json({ error: true, messageId: 'ERR_NOT_FOUND' }));

export default app;
