import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFreshness, getFreshnessLabel } from '../src/freshness/index.js';

describe('Domain: Price Freshness', () => {
  const now = new Date('2026-10-16T12:00:00Z');

  it('marks check within 24 hours as fresh', () => {
    const freshDate = new Date('2026-10-16T02:00:00Z'); // 10 hours ago
    assert.equal(calculateFreshness(freshDate, now), 'fresh');
    const label = getFreshnessLabel('fresh', freshDate);
    assert.ok(label.includes('Price checked'));
  });

  it('marks check between 24h and 7d as aging', () => {
    const agingDate = new Date('2026-10-13T12:00:00Z'); // 3 days ago
    assert.equal(calculateFreshness(agingDate, now), 'aging');
    const label = getFreshnessLabel('aging', agingDate);
    assert.ok(label.includes('price may have changed'));
  });

  it('marks check older than 7 days as stale', () => {
    const staleDate = new Date('2026-10-01T12:00:00Z'); // 15 days ago
    assert.equal(calculateFreshness(staleDate, now), 'stale');
    const label = getFreshnessLabel('stale', staleDate);
    assert.equal(label, 'Price not recently verified. Check seller site for current price.');
  });

  it('marks null or invalid dates as unknown', () => {
    assert.equal(calculateFreshness(null, now), 'unknown');
    assert.equal(calculateFreshness(undefined, now), 'unknown');
    assert.equal(calculateFreshness('invalid-date', now), 'unknown');
    assert.equal(getFreshnessLabel('unknown'), 'Current price could not be verified.');
  });
});
