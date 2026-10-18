/**
 * User roles in the platform
 */
export type UserRole = 'buyer' | 'seller' | 'admin';

/**
 * Verification statuses for sellers and brands
 */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'suspended';

/**
 * Types of sellers on the platform
 */
export type SellerType =
  | 'brand_owned'
  | 'independent_store'
  | 'reseller'
  | 'marketplace_seller'
  | 'other';

/**
 * Membership roles within a seller organisation
 */
export type SellerMembershipRole = 'owner' | 'manager' | 'catalogue_editor';

/**
 * Types of relationships between brands and sellers
 */
export type BrandSellerRelationshipType =
  | 'brand_owned'
  | 'authorised_reseller'
  | 'marketplace_listing'
  | 'unknown';

/**
 * Product identity verification status
 */
export type ProductIdentityStatus = 'candidate' | 'verified' | 'rejected';

/**
 * Offer availability status
 */
export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'preorder' | 'unknown';

/**
 * Seller offer status
 */
export type OfferStatus =
  | 'pending_review'
  | 'active'
  | 'stale'
  | 'unavailable'
  | 'rejected'
  | 'removed';

/**
 * Offer match status against a canonical product
 */
export type MatchStatus = 'unmatched' | 'candidate' | 'confirmed_exact' | 'rejected_match';

/**
 * Match candidate types between products
 */
export type MatchType = 'exact_candidate' | 'similar_style';

/**
 * Candidate review status
 */
export type CandidateStatus = 'pending' | 'confirmed' | 'rejected';

/**
 * Approved data source types
 */
export type DataSourceType =
  | 'seller_upload'
  | 'authorised_api'
  | 'affiliate_feed'
  | 'partner_feed'
  | 'manual_admin';

/**
 * Data source permission statuses
 */
export type DataSourcePermissionStatus = 'pending' | 'approved' | 'restricted' | 'revoked';

/**
 * Ingestion job status
 */
export type ImportJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'partial'
  | 'failed'
  | 'cancelled';

/**
 * Price freshness status (Section 9.4)
 */
export type FreshnessStatus = 'fresh' | 'aging' | 'stale' | 'unknown';

/**
 * Cost calculation outcome (Section 7.4)
 */
export interface TotalCostCalculation {
  itemPriceMinor: number;
  shippingMinor: number | null;
  mandatoryFeesMinor: number | null;
  discountMinor: number | null;
  totalKnownMinor: number | null;
  isComplete: boolean;
  currency: string;
  notes: string[];
}
