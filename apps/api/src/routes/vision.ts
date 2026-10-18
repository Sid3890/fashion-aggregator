import { Router, Request, Response, NextFunction } from 'express';
import { VisionAnalysisRequestSchema, VisualSearchResponse } from '@fashion-aggregator/contracts';
import { analyzeFashionImage } from '../services/visionAnalyzer.js';
import { aggregateProductsFromVision } from '../services/aggregatorService.js';

export const visionRouter = Router();

/**
 * POST /api/v1/vision/analyze
 * Extracts fashion attributes (garment type, colors, pattern, style) from an image.
 */
visionRouter.post('/vision/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = VisionAnalysisRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        type: 'https://fashion-aggregator.internal/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid image data provided for visual analysis',
        invalidParams: parseResult.error.errors.map((e) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
      return;
    }

    const { imageBase64, imageUrl, fileName, departmentHint } = parseResult.data;
    const analysis = await analyzeFashionImage({
      imageBase64,
      imageUrl,
      fileName,
      departmentHint,
    });

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/vision/search
 * Core Platform Feature:
 * 1. Analyzes the input image with the Vision Intelligence Model.
 * 2. Uses the extracted parameters to scrape & aggregate real live products from retail stores.
 * 3. Returns the recognized visual attributes along with the live scraped products.
 */
visionRouter.post('/vision/search', async (req: Request, res: Response, next: NextFunction) => {
  const start = performance.now();
  try {
    const parseResult = VisionAnalysisRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        type: 'https://fashion-aggregator.internal/errors/validation',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid visual search request payload',
        invalidParams: parseResult.error.errors.map((e) => ({
          name: e.path.join('.'),
          reason: e.message,
        })),
      });
      return;
    }

    const { imageBase64, imageUrl, fileName, departmentHint, stores, limit } = parseResult.data;

    // 1. Visual Recognition
    const analysis = await analyzeFashionImage({
      imageBase64,
      imageUrl,
      fileName,
      departmentHint,
    });

    // 2. Multi-Store Scrape Aggregation
    const { products, totalAvailable, storesQueried } = await aggregateProductsFromVision(
      analysis,
      stores,
      limit || 20
    );

    const elapsedMs = Math.round(performance.now() - start);

    const responsePayload: VisualSearchResponse = {
      success: true,
      analysis,
      products,
      storesQueried,
      totalCountAvailable: totalAvailable,
      resultsCount: products.length,
      elapsedMs,
      timestamp: new Date().toISOString(),
    };

    res.json(responsePayload);
  } catch (error) {
    next(error);
  }
});
