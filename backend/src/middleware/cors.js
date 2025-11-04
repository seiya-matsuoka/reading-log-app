import cors from 'cors';

const FRONTEND = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const corsMiddleware = cors({
  origin: FRONTEND,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Demo-User'],
  credentials: false,
});

export default corsMiddleware;
