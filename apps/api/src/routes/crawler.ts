import { Router, Request, Response, NextFunction } from 'express';
import { MyntraCrawlRequestSchema } from '@fashion-aggregator/contracts';
import { crawlMyntra } from '../services/myntraCrawler.js';

export const crawlerRouter = Router();

/**
 * POST /api/v1/crawl/myntra
 * Crawls Myntra on-demand for matching color & clothing model/category
 */
crawlerRouter.post('/crawl/myntra', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = MyntraCrawlRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        type: 'https://fashion-aggregator.internal/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid parameters provided for Myntra crawler',
        invalidParams: parseResult.error.errors.map((e) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
      return;
    }

    const crawlResult = await crawlMyntra(parseResult.data);
    res.json(crawlResult);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/crawl/myntra
 * Alternate GET interface with query parameters
 */
crawlerRouter.get('/crawl/myntra', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitNum = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const parseResult = MyntraCrawlRequestSchema.safeParse({
      color: req.query.color,
      model: req.query.model,
      gender: req.query.gender,
      limit: limitNum,
    });

    if (!parseResult.success) {
      res.status(400).json({
        type: 'https://fashion-aggregator.internal/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid query parameters provided for Myntra crawler',
        invalidParams: parseResult.error.errors.map((e) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
      return;
    }

    const crawlResult = await crawlMyntra(parseResult.data);
    res.json(crawlResult);
  } catch (error: any) {
    next(error);
  }
});
