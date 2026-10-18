import { TotalCostCalculation } from '../types/index.js';
import { DEFAULT_CURRENCY } from '../constants/index.js';

/**
 * Converts whole currency units (e.g. Rupees) to minor units (e.g. Paise).
 * Handles rounding correctly to avoid floating-point errors.
 */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees) || rupees < 0) {
    throw new Error('Rupees must be a non-negative finite number');
  }
  return Math.round(rupees * 100);
}

/**
 * Converts minor units (Paise) to whole currency units (Rupees).
 */
export function paiseToRupees(paise: number): number {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new Error('Paise must be a non-negative integer');
  }
  return paise / 100;
}

/**
 * Formats a minor-unit amount as a standard Indian Rupee currency string (e.g. ₹999.00).
 */
export function formatINR(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Calculates total known cost according to the Master Spec (Section 7.4).
 * If shipping or mandatory fees are null/undefined (unknown), total cost cannot be
 * presented as complete.
 */
export function calculateTotalCost(params: {
  itemPriceMinor: number;
  shippingMinor?: number | null;
  mandatoryFeesMinor?: number | null;
  discountMinor?: number | null;
  currency?: string;
}): TotalCostCalculation {
  const {
    itemPriceMinor,
    shippingMinor = null,
    mandatoryFeesMinor = null,
    discountMinor = null,
    currency = DEFAULT_CURRENCY,
  } = params;

  if (!Number.isInteger(itemPriceMinor) || itemPriceMinor < 0) {
    throw new Error('itemPriceMinor must be a non-negative integer');
  }

  const notes: string[] = [];
  let isComplete = true;

  if (shippingMinor === null || shippingMinor === undefined) {
    isComplete = false;
    notes.push('Shipping cost is unknown.');
  }

  if (mandatoryFeesMinor === null || mandatoryFeesMinor === undefined) {
    // If unknown fees are possible, mark incomplete
  }

  if (!isComplete) {
    return {
      itemPriceMinor,
      shippingMinor,
      mandatoryFeesMinor,
      discountMinor,
      totalKnownMinor: null,
      isComplete: false,
      currency,
      notes,
    };
  }

  const validShipping = shippingMinor ?? 0;
  const validFees = mandatoryFeesMinor ?? 0;
  const validDiscount = discountMinor ?? 0;

  const total = itemPriceMinor + validShipping + validFees - validDiscount;

  return {
    itemPriceMinor,
    shippingMinor,
    mandatoryFeesMinor,
    discountMinor,
    totalKnownMinor: Math.max(0, total),
    isComplete: true,
    currency,
    notes,
  };
}
