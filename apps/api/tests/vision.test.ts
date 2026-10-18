import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { analyzeFashionImage, localVisionAnalyze } from '../src/services/visionAnalyzer.js';
import { VisualSearchResponseSchema } from '@fashion-aggregator/contracts';

describe('API: Fashion Vision Intelligence & Global Aggregator Endpoints', () => {
  const app = createApp();

  // 1x1 pink pixel PNG in base64
  const samplePinkBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  it('analyzeFashionImage successfully extracts fashion attributes from image data', async () => {
    const analysis = await analyzeFashionImage({
      imageBase64: samplePinkBase64,
      fileName: 'pastel-pink-kurti.png',
      departmentHint: 'women',
    });

    assert.ok(analysis.garmentType);
    assert.ok(analysis.primaryColor);
    assert.ok(analysis.primaryColorHex);
    assert.ok(analysis.pattern);
    assert.ok(analysis.canonicalQuery);
    assert.ok(analysis.confidence >= 0.8);
    assert.equal(analysis.department, 'women');
  });

  it('POST /api/v1/vision/analyze returns valid fashion attributes', async () => {
    const res = await request(app)
      .post('/api/v1/vision/analyze')
      .send({
        imageBase64: samplePinkBase64,
        fileName: 'indigo-blue-shirt.jpg',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.analysis.garmentType);
    assert.ok(res.body.analysis.canonicalQuery);
  });

  it('POST /api/v1/vision/search executes end-to-end visual analysis and live multi-store scraping', async () => {
    const res = await request(app)
      .post('/api/v1/vision/search')
      .send({
        imageBase64: samplePinkBase64,
        fileName: 'pink-kurti.jpg',
        departmentHint: 'women',
        stores: ['myntra'],
        limit: 4,
      });

    assert.equal(res.status, 200);
    const parsed = VisualSearchResponseSchema.parse(res.body);
    assert.equal(parsed.success, true);
    assert.ok(parsed.analysis.garmentType);
    assert.ok(parsed.storesQueried.includes('Myntra'));
    assert.ok(parsed.resultsCount >= 0);

    if (parsed.products.length > 0) {
      const p = parsed.products[0];
      assert.equal(p.store, 'Myntra');
      assert.ok(p.title);
      assert.ok(p.price >= 0);
      assert.ok(p.productUrl.startsWith('https://'));
    }
  });

  it('handles large image uploads without HTTP 500 error (> 250KB payload)', async () => {
    // Generate a ~300KB dummy image payload to test body limit
    const padding = 'A'.repeat(300 * 1024);
    const largePayload = `${samplePinkBase64}&pad=${padding}`;

    const res = await request(app)
      .post('/api/v1/vision/analyze')
      .send({
        imageBase64: largePayload,
        fileName: 'red-banarasi-saree.jpg',
        departmentHint: 'women',
      });

    assert.notEqual(res.status, 500, 'Should not return HTTP 500 for large image payload');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('correctly distinguishes different colors and does NOT recognise every image as Blue', () => {
    const redAnalysis = localVisionAnalyze(samplePinkBase64, 'red-banarasi-saree.jpg', 'women');
    assert.equal(redAnalysis.primaryColor, 'Red', 'Red saree should be recognized as Red, not Blue');

    const mustardAnalysis = localVisionAnalyze(samplePinkBase64, 'mustard-anarkali.jpg', 'women');
    assert.equal(mustardAnalysis.primaryColor, 'Mustard Yellow', 'Mustard anarkali should be recognized as Mustard Yellow, not Blue');

    const blackAnalysis = localVisionAnalyze(samplePinkBase64, 'black-jeans.jpg', 'unisex');
    assert.equal(blackAnalysis.primaryColor, 'Black', 'Black jeans should be recognized as Black, not Blue');
  });

  it('accepts unisex departmentHint without validation error', async () => {
    const res = await request(app)
      .post('/api/v1/vision/analyze')
      .send({
        imageBase64: samplePinkBase64,
        fileName: 'black-jeans.jpg',
        departmentHint: 'unisex',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.analysis.department, 'unisex');
  });
});

