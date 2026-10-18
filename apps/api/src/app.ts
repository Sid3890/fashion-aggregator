import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { apiV1Router } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  // Security & utility middleware
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
          config.corsAllowedOrigins.includes(origin) ||
          config.corsAllowedOrigins.includes('*')
        ) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/bootstrap
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(requestIdMiddleware);

  // Health route at root: GET /health
  app.use('/', healthRouter);

  // API v1 routes: GET /api/v1/health, etc.
  app.use('/api/v1', apiV1Router);

  // 404 & Central Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
