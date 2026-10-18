import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { HealthResponseSchema, ErrorResponseSchema } from '@fashion-aggregator/contracts';

describe('API: Health Check Endpoints', () => {
  const app = createApp();

  it('GET /health returns 200 and matches HealthResponseSchema', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /json/);
    assert.ok(res.headers['x-request-id']);

    const parsed = HealthResponseSchema.parse(res.body);
    assert.equal(parsed.status, 'ok');
    assert.equal(parsed.version, '0.1.0');
    assert.equal(parsed.service, 'fashion-aggregator-api');

    // Ensure no secrets or environment variables leaked
    assert.equal('DATABASE_URL' in res.body, false);
    assert.equal('SESSION_SECRET' in res.body, false);
    assert.equal('LLM_API_KEY' in res.body, false);
  });

  it('GET /api/v1/health returns 200 and matches HealthResponseSchema', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    const parsed = HealthResponseSchema.parse(res.body);
    assert.equal(parsed.status, 'ok');
  });

  it('GET /unknown-route returns 404 with standardized error response shape', async () => {
    const res = await request(app).get('/unknown-route');
    assert.equal(res.status, 404);
    const parsed = ErrorResponseSchema.parse(res.body);
    assert.equal(parsed.error.code, 'NOT_FOUND');
    assert.ok(parsed.error.requestId);
  });
});
