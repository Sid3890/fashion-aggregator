export const DEFAULT_CURRENCY = 'INR';

/**
 * Freshness duration thresholds in milliseconds (Section 9.4)
 * - Fresh: checked within 24 hours
 * - Aging: checked between 24 hours and 7 days
 * - Stale: older than 7 days
 */
export const FRESHNESS_THRESHOLDS_MS = {
  FRESH: 24 * 60 * 60 * 1000, // 24 hours
  AGING: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const USER_ROLES = ['buyer', 'seller', 'admin'] as const;

export const SELLER_TYPES = [
  'brand_owned',
  'independent_store',
  'reseller',
  'marketplace_seller',
  'other',
] as const;

export const AVAILABILITY_STATUSES = [
  'in_stock',
  'out_of_stock',
  'preorder',
  'unknown',
] as const;

export const OFFER_STATUSES = [
  'pending_review',
  'active',
  'stale',
  'unavailable',
  'rejected',
  'removed',
] as const;

export const MATCH_STATUSES = [
  'unmatched',
  'candidate',
  'confirmed_exact',
  'rejected_match',
] as const;
