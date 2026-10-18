import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { buildMyntraSlug } from '../src/services/myntraCrawler.js';
import { MyntraCrawlResponseSchema } from '@fashion-aggregator/contracts';

describe('API: Myntra On-Demand Crawler Endpoints', () => {
  const app = createApp();

  it('buildMyntraSlug formats color and model into clean slug', () => {
    assert.equal(buildMyntraSlug({ color: 'Pastel Pink', model: 'Kurti' }), 'pastel-pink-kurti');
    assert.equal(buildMyntraSlug({ gender: 'men', color: 'indigo blue', model: 'shirt' }), 'men-indigo-blue-shirt');
    assert.equal(buildMyntraSlug({ gender: 'all', color: 'black', model: 'jeans' }), 'black-jeans');
  });

  it('POST /api/v1/crawl/myntra rejects missing parameters with 400', async () => {
    const res = await request(app)
      .post('/api/v1/crawl/myntra')
      .send({ color: '' });

    assert.equal(res.status, 400);
    assert.equal(res.body.title, 'Validation Error');
  });

  it('POST /api/v1/crawl/myntra successfully scrapes real products', async () => {
    const res = await request(app)
      .post('/api/v1/crawl/myntra')
      .send({
        color: 'blue',
        model: 'shirt',
        gender: 'all',
        limit: 5,
      });

    // In a live test with internet access, it should return 200 and match the schema
    assert.equal(res.status, 200);
    const parsed = MyntraCrawlResponseSchema.parse(res.body);
    assert.equal(parsed.source, 'myntra');
    assert.equal(parsed.querySlug, 'blue-shirt');
    assert.ok(parsed.resultsCount >= 0);

    if (parsed.products.length > 0) {
      const first = parsed.products[0];
      assert.ok(first.id);
      assert.ok(first.brand);
      assert.ok(first.title);
      assert.ok(first.price >= 0);
      assert.ok(first.productUrl.startsWith('https://www.myntra.com/'));
    }
  });
});
