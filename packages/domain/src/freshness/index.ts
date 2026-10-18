import { FreshnessStatus } from '../types/index.js';
import { FRESHNESS_THRESHOLDS_MS } from '../constants/index.js';

/**
 * Calculates price freshness status based on timestamp (Section 9.4):
 * - Fresh: checked within 24 hours
 * - Aging: checked between 24 hours and 7 days
 * - Stale: older than 7 days
 * - Unknown: never checked or invalid date
 */
export function calculateFreshness(
  lastCheckedAt?: Date | string | null,
  now: Date = new Date()
): FreshnessStatus {
  if (!lastCheckedAt) {
    return 'unknown';
  }

  const checkDate = typeof lastCheckedAt === 'string' ? new Date(lastCheckedAt) : lastCheckedAt;
  const timestamp = checkDate.getTime();

  if (isNaN(timestamp)) {
    return 'unknown';
  }

  const elapsedMs = now.getTime() - timestamp;
  if (elapsedMs < 0) {
    // Clock skew / future date treated as fresh
    return 'fresh';
  }

  if (elapsedMs <= FRESHNESS_THRESHOLDS_MS.FRESH) {
    return 'fresh';
  }

  if (elapsedMs <= FRESHNESS_THRESHOLDS_MS.AGING) {
    return 'aging';
  }

  return 'stale';
}

/**
 * Returns standard UI wording according to Section 9.4:
 * - Fresh: “Price checked [time/date].”
 * - Aging: “Last checked [time/date]; price may have changed.”
 * - Stale: “Price not recently verified. Check seller site for current price.”
 * - Unknown: “Current price could not be verified.”
 */
export function getFreshnessLabel(
  status: FreshnessStatus,
  lastCheckedAt?: Date | string | null
): string {
  if (status === 'unknown' || !lastCheckedAt) {
    return 'Current price could not be verified.';
  }

  const checkDate = typeof lastCheckedAt === 'string' ? new Date(lastCheckedAt) : lastCheckedAt;
  const formatted = isNaN(checkDate.getTime()) ? '' : checkDate.toLocaleDateString('en-IN');

  switch (status) {
    case 'fresh':
      return formatted ? `Price checked ${formatted}.` : 'Price recently verified.';
    case 'aging':
      return formatted
        ? `Last checked ${formatted}; price may have changed.`
        : 'Price may have changed.';
    case 'stale':
      return 'Price not recently verified. Check seller site for current price.';
    default:
      return 'Current price could not be verified.';
  }
}
