import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import healthRouter from './routes/health.js';
import adminRouter from './routes/admin.js';
import verifyRouter from './routes/verify.js';

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRouter);
app.use('/api/admin', adminRouter);
app.use('/api/verify', verifyRouter);

// Global error handler (for async controller errors)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;