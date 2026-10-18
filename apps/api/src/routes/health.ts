import { Router, Request, Response } from 'express';
import { HealthResponse } from '@fashion-aggregator/contracts';
import { config } from '../config/index.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const payload: HealthResponse = {
    status: 'ok',
    version: config.version,
    service: config.serviceName,
    environment: config.env,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime() * 100) / 100,
  };

  res.status(200).json(payload);
});
