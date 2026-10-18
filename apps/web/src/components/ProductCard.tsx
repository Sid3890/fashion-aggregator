'use client';

import { Product } from '../types/catalog';
import { formatINR, getFreshnessLabel } from '@fashion-aggregator/domain';
import { validateOutboundUrl } from '../utils/outboundUrl';

interface ProductCardProps {
  product: Product;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onFindSimilar: (product: Product) => void;
}

export function ProductCard({
  product,
  isCompared,
  onToggleCompare,
  onFindSimilar,
}: ProductCardProps) {
  const discountPercent = Math.round(
    ((product.originalPriceMinor - product.lowestPriceMinor) / product.originalPriceMinor) * 100
  );

  const bestOffer = product.offers[0];
  const offerCount = product.offers.length;
  const freshnessText = getFreshnessLabel(product.freshnessStatus, product.lastCheckedAt);
  const validatedOutbound = validateOutboundUrl(bestOffer?.productUrl, {
    canonicalProductId: product.id,
    offerCanonicalProductId: bestOffer?.canonicalProductId,
    isVerifiedMatch: bestOffer?.isVerifiedMatch,
    verificationSource: bestOffer?.verificationSource,
    expectedBrand: product.brand,
  });

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-rose-200 dark:hover:border-rose-900/60 transition-all duration-300">
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-black tracking-tight bg-rose-600 text-white shadow-md shadow-rose-600/30">
            {discountPercent}% OFF
          </span>
        )}

        {/* Price Freshness Pill */}
        <div
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md shadow-xs flex items-center gap-1 ${
            product.freshnessStatus === 'fresh'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
              : product.freshnessStatus === 'aging'
              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
              : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
          }`}
          title={freshnessText}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              product.freshnessStatus === 'fresh'
                ? 'bg-emerald-400'
                : product.freshnessStatus === 'aging'
                ? 'bg-amber-400'
                : 'bg-rose-400'
            }`}
          />
          <span className="capitalize">{product.freshnessStatus}</span>
        </div>

        {/* Hover Quick Action: Similar Styles */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFindSimilar(product);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-white/95 dark:bg-slate-900/95 hover:bg-white text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span>Similar Styles</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Verified Badge */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <span>{product.brand}</span>
              {product.brandVerified && (
                <svg className="w-3.5 h-3.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified Brand">
                  <title>Verified Brand</title>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </span>

            <div className="flex items-center gap-1.5">
              {product.isDemo && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Demo
                </span>
              )}
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {product.fabric}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {product.title}
          </h3>

          {/* Color & Size Specs */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: product.colorHex }} />
              <span>{product.color}</span>
            </span>
            <span>•</span>
            <span className="truncate">Sizes: {product.availableSizes.join(', ')}</span>
          </div>
        </div>

        {/* Pricing & Multi-Store Aggregation */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {formatINR(product.lowestPriceMinor)}
            </span>
            <span className="text-xs text-slate-400 line-through">
              {formatINR(product.originalPriceMinor)}
            </span>
          </div>

          {/* Multi-Store Comparison Indicator */}
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {offerCount} {offerCount === 1 ? 'store offer' : 'store offers'}
              </span>
              <span>from {bestOffer?.sellerName}</span>
            </span>
          </div>

          {/* Card Actions: Compare Checkbox & Visit Store Outbound */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
            {/* Compare Checkbox */}
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onToggleCompare(product)}
                className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className={isCompared ? 'font-bold text-rose-600' : ''}>Compare</span>
            </label>

            {/* Visit Store Outbound Link or Unavailable State */}
            {validatedOutbound.isValid && validatedOutbound.sanitizedUrl ? (
              <a
                href={validatedOutbound.sanitizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition active:scale-95"
              >
                <span>Visit {bestOffer?.sellerName || 'Store'}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700 select-none"
                title="Product link unavailable"
              >
                <span>Product link unavailable</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
