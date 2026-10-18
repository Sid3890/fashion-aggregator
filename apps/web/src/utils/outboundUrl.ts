/**
 * Outbound URL validation utility for fashion retailer product listings.
 * Enforces HTTPS protocols, retailer domain allowlists, canonical product matching,
 * verified match evidence, and rejects bare homepages or search queries.
 */

import { VerificationSource } from '../types/catalog';

export const ALLOWED_RETAILER_DOMAINS = [
  'myntra.com',
  'tatacliq.com',
  'ajio.com',
  'nykaafashion.com',
  'fabindia.com',
  'biba.in',
  'kalkifashion.com',
  'globaldesi.in',
] as const;

export type AllowedRetailerDomain = (typeof ALLOWED_RETAILER_DOMAINS)[number];

export interface OutboundValidationContext {
  canonicalProductId?: string;
  offerCanonicalProductId?: string;
  isVerifiedMatch?: boolean;
  verificationSource?: VerificationSource;
  expectedBrand?: string;
  expectedCategory?: string;
}

export interface OutboundValidationResult {
  isValid: boolean;
  sanitizedUrl: string | null;
  reason?: string;
  retailerDomain?: string;
  isVerifiedMatch?: boolean;
}

/**
 * Validates that an outbound retailer URL is an explicit HTTPS product listing
 * on an approved destination, preventing open redirects, general homepage fallbacks,
 * mismatched canonical products, and unverified illustrative listings.
 */
export function validateOutboundUrl(
  url: string | null | undefined,
  context?: OutboundValidationContext
): OutboundValidationResult {
  // 1. Missing or empty URL
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Product link unavailable',
      isVerifiedMatch: false,
    };
  }

  // 2. Canonical Product ID Matching check:
  // Ensure the seller offer is actually associated with the requested canonical product
  if (
    context?.canonicalProductId &&
    context?.offerCanonicalProductId &&
    context.canonicalProductId !== context.offerCanonicalProductId
  ) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: `Product mismatch: Seller offer is linked to canonical product "${context.offerCanonicalProductId}" but displayed for "${context.canonicalProductId}"`,
      isVerifiedMatch: false,
    };
  }

  // 3. Reliable Match Verification:
  // URL syntax and domain validation alone cannot prove that a listing matches a product.
  // Only mark a product match as verified when there is reliable evidence from an authorized
  // catalog feed, partner API, or manual audit.
  if (context?.isVerifiedMatch === false) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Product match unverified: requires authorized catalog feed confirmation',
      isVerifiedMatch: false,
    };
  }

  const trimmed = url.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Malformed URL format',
      isVerifiedMatch: false,
    };
  }

  // 4. Enforce HTTPS only (no HTTP, javascript:, data:, etc.)
  if (parsed.protocol !== 'https:') {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Insecure protocol: only HTTPS retailer destinations are permitted',
      isVerifiedMatch: false,
    };
  }

  // 5. Enforce verified retailer domain allowlist
  const hostname = parsed.hostname.toLowerCase();
  const matchedDomain = ALLOWED_RETAILER_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (!matchedDomain) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: `Untrusted retailer destination: domain "${hostname}" is not in the verified retailer allowlist`,
      isVerifiedMatch: false,
    };
  }

  // 6. Ensure it is a product-specific listing, not a general retailer homepage
  const pathname = parsed.pathname.trim();
  if (!pathname || pathname === '/' || pathname === '') {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'General retailer homepage is not a product listing',
      retailerDomain: matchedDomain,
      isVerifiedMatch: false,
    };
  }

  // 7. Ensure it is not a constructed search query or search results page
  if (
    pathname.startsWith('/search') ||
    pathname === '/shop' ||
    parsed.searchParams.has('q') ||
    parsed.searchParams.has('query')
  ) {
    return {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Search result URL is not an explicit product listing',
      retailerDomain: matchedDomain,
      isVerifiedMatch: false,
    };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
    retailerDomain: matchedDomain,
    isVerifiedMatch: context?.isVerifiedMatch ?? true,
  };
}
