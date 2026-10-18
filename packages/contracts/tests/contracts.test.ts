import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HealthResponseSchema, ErrorResponseSchema, PaginationQuerySchema } from '../src/index.js';

describe('Contracts: Zod Schemas', () => {
  it('validates a correct health check payload', () => {
    const valid = {
      status: 'ok',
      version: '0.1.0',
      service: 'fashion-aggregator-api',
      environment: 'development',
      timestamp: new Date().toISOString(),
      uptime: 42.5,
    };
    const parsed = HealthResponseSchema.parse(valid);
    assert.equal(parsed.status, 'ok');
    assert.equal(parsed.version, '0.1.0');
  });

  it('rejects an invalid health check payload', () => {
    const invalid = {
      status: 'error',
      version: 123,
    };
    assert.throws(() => HealthResponseSchema.parse(invalid));
  });

  it('validates standard error response shape', () => {
    const validError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        requestId: 'req-123',
        details: [{ field: 'query', message: 'Required' }],
      },
    };
    const parsed = ErrorResponseSchema.parse(validError);
    assert.equal(parsed.error.code, 'VALIDATION_ERROR');
    assert.equal(parsed.error.details?.[0].field, 'query');
  });

  it('applies defaults to pagination query', () => {
    const parsed = PaginationQuerySchema.parse({});
    assert.equal(parsed.pageSize, 24);
    assert.equal(parsed.cursor, undefined);
  });
});
