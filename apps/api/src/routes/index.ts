import { Router } from 'express';
import { healthRouter } from './health.js';
import { crawlerRouter } from './crawler.js';
import { visionRouter } from './vision.js';

export const apiV1Router = Router();

// Mount health check under /api/v1 as well
apiV1Router.use('/', healthRouter);

// Mount crawler endpoints under /api/v1
apiV1Router.use('/', crawlerRouter);

// Mount vision endpoints under /api/v1
apiV1Router.use('/', visionRouter);
