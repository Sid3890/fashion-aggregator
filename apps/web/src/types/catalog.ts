import { TotalCostCalculation, FreshnessStatus } from '@fashion-aggregator/domain';

export type ProductCategory =
  | 'Kurtis'
  | 'Sarees'
  | 'Ethnic Sets'
  | 'Dresses'
  | 'Tops'
  | 'Jeans'
  | 'Footwear';

export type VerificationSource =
  | 'authorized_catalog_feed'
  | 'partner_api'
  | 'manual_audit'
  | 'demo_illustrative';

export interface SellerOffer {
  id: string;
  canonicalProductId: string; // explicitly references canonical product ID
  sellerName: string;
  sellerType: 'brand_owned' | 'marketplace_seller' | 'reseller';
  priceMinor: number; // in paise
  currency: 'INR';
  originalPriceMinor: number; // in paise
  shippingMinor: number | null; // null if shipping unknown
  mandatoryFeesMinor: number | null;
  discountMinor: number | null;
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  lastCheckedAt: string; // ISO date string
  verificationSource: VerificationSource;
  isVerifiedMatch: boolean; // true only when verified by authorized feed or manual audit
  productUrl: string | null;
  returnDays: number;
  deliveryDays: string;
  calculatedCost?: TotalCostCalculation;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  brandVerified: boolean;
  isDemo?: boolean; // clearly marks demo illustrative items
  category: ProductCategory;
  color: string;
  colorHex: string;
  availableSizes: string[];
  fabric: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  description: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  styleKeywords: string[];
  offers: SellerOffer[];
  lowestPriceMinor: number; // Lowest active offer price in paise
  originalPriceMinor: number;
  freshnessStatus: FreshnessStatus;
  lastCheckedAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: ProductCategory | 'All';
  brands: string[];
  priceRange: [number, number]; // in Rupees
  colors: string[];
  sizes: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'discount' | 'rating';
}
