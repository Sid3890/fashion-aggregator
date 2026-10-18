import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rupeesToPaise, paiseToRupees, formatINR, calculateTotalCost } from '../src/money/index.js';

describe('Domain: Money & Minor Units', () => {
  it('correctly converts rupees to paise without floating-point errors', () => {
    assert.equal(rupeesToPaise(999), 99900);
    assert.equal(rupeesToPaise(0), 0);
    assert.equal(rupeesToPaise(12.34), 1234);
    assert.equal(rupeesToPaise(49.99), 4999);
  });

  it('correctly converts paise to rupees', () => {
    assert.equal(paiseToRupees(99900), 999);
    assert.equal(paiseToRupees(1234), 12.34);
    assert.equal(paiseToRupees(0), 0);
  });

  it('formats INR currency string properly', () => {
    const formatted = formatINR(99900);
    assert.match(formatted, /999\.00/);
    assert.match(formatted, /₹|INR/);
  });

  it('marks total cost as incomplete when shipping is unknown', () => {
    const result = calculateTotalCost({
      itemPriceMinor: 99900,
      shippingMinor: null,
    });
    assert.equal(result.isComplete, false);
    assert.equal(result.totalKnownMinor, null);
    assert.ok(result.notes.includes('Shipping cost is unknown.'));
  });

  it('calculates total cost when all components are known', () => {
    const result = calculateTotalCost({
      itemPriceMinor: 99900,
      shippingMinor: 5000,
      mandatoryFeesMinor: 1000,
      discountMinor: 5000,
    });
    assert.equal(result.isComplete, true);
    assert.equal(result.totalKnownMinor, 100900);
  });
});
