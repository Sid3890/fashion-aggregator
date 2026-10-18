'use client';

import { useState } from 'react';
import { Product } from '../types/catalog';
import { formatINR, calculateTotalCost, getFreshnessLabel } from '@fashion-aggregator/domain';
import { validateOutboundUrl } from '../utils/outboundUrl';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export function ComparisonModal({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClearAll,
}: ComparisonModalProps) {
  const [selectedOfferIds, setSelectedOfferIds] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSelectOffer = (productId: string, offerId: string) => {
    setSelectedOfferIds((prev) => ({
      ...prev,
      [productId]: offerId,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </span>
              <h2 id="compare-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Multi-Product & Store Comparison
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing {products.length} {products.length === 1 ? 'item' : 'items'} across pricing, seller fees, fabric specs, and freshness
              </p>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Demo Illustrative Offers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {products.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
              aria-label="Close comparison modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body: Comparison Table */}
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No products selected for comparison
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Click &quot;Compare&quot; on any product card in the catalog to add items side by side.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse text-left text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-3 w-40 text-slate-400 font-medium">Feature</th>
                  {products.map((p) => (
                    <th key={p.id} className="py-3 px-3 w-64 align-top">
                      <div className="relative group">
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-200 flex items-center justify-center transition cursor-pointer"
                          title="Remove from compare"
                        >
                          ✕
                        </button>
                        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-rose-600">{p.brand}</span>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 mt-0.5">
                          {p.title}
                        </h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Lowest Price Row */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Best Price
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-3 px-3">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatINR(p.lowestPriceMinor)}
                      </span>
                      <span className="ml-1 text-[11px] text-slate-400 line-through">
                        {formatINR(p.originalPriceMinor)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Seller Offers Matrix & Shipping Total */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 align-top">
                    Seller Offers & Total Cost
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-3 px-3 align-top space-y-2">
                      {p.offers.map((offer) => {
                        const isSelected = (selectedOfferIds[p.id] || p.offers[0]?.id) === offer.id;
                        const costCalc = calculateTotalCost({
                          itemPriceMinor: offer.priceMinor,
                          shippingMinor: offer.shippingMinor,
                          mandatoryFeesMinor: offer.mandatoryFeesMinor,
                          discountMinor: offer.discountMinor,
                        });
                        const offerValidation = validateOutboundUrl(offer.productUrl, {
                          canonicalProductId: p.id,
                          offerCanonicalProductId: offer.canonicalProductId,
                          isVerifiedMatch: offer.isVerifiedMatch,
                          verificationSource: offer.verificationSource,
                          expectedBrand: p.brand,
                        });

                        return (
                          <div
                            key={offer.id}
                            onClick={() => handleSelectOffer(p.id, offer.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800 ring-1 ring-rose-500/20'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-800 dark:text-slate-200">
                                  {offer.sellerName}
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-900 dark:text-white font-bold">
                                {formatINR(offer.priceMinor)}
                              </span>
                            </div>

                            {/* Section 7.4 Total Known Cost Rule */}
                            <div className="mt-1 text-[11px] space-y-0.5 text-slate-500 dark:text-slate-400">
                              <p>
                                Shipping:{' '}
                                {offer.shippingMinor === null ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    Unknown (Not represented as free)
                                  </span>
                                ) : offer.shippingMinor === 0 ? (
                                  <span className="text-emerald-600 font-medium">Free</span>
                                ) : (
                                  formatINR(offer.shippingMinor)
                                )}
                              </p>

                              <p>
                                Total Known:{' '}
                                {costCalc.isComplete && costCalc.totalKnownMinor !== null ? (
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {formatINR(costCalc.totalKnownMinor)}
                                  </span>
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400">
                                    Incomplete ({costCalc.notes.join(', ')})
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Est. Delivery: {offer.deliveryDays} • Return: {offer.returnDays}d
                              </p>
                            </div>

                            {/* Direct Outbound Action for this Offer */}
                            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">
                                {isSelected ? 'Active Offer' : 'Click to select'}
                              </span>
                              {offerValidation.isValid && offerValidation.sanitizedUrl ? (
                                <a
                                  href={offerValidation.sanitizedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 inline-flex items-center gap-1"
                                >
                                  <span>Visit {offer.sellerName}</span>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                                  Product link unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </td>
                  ))}
                </tr>

                {/* Fabric & Material */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Fabric & Material
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {p.fabric}
                    </td>
                  ))}
                </tr>

                {/* Color & Sizes */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Color & Sizes
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-3 px-3 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: p.colorHex }}
                        />
                        <span>{p.color}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Available: {p.availableSizes.join(', ')}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Price Freshness Verification */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Price Freshness
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.freshnessStatus === 'fresh'
                              ? 'bg-emerald-500'
                              : p.freshnessStatus === 'aging'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="capitalize font-medium text-slate-800 dark:text-slate-200">
                          {p.freshnessStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {getFreshnessLabel(p.freshnessStatus, p.lastCheckedAt)}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Outbound Link Action for the Selected Seller Offer */}
                <tr>
                  <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    Direct Outbound
                  </td>
                  {products.map((p) => {
                    const activeOffer =
                      p.offers.find((o) => o.id === selectedOfferIds[p.id]) || p.offers[0];
                    const validated = validateOutboundUrl(activeOffer?.productUrl, {
                      canonicalProductId: p.id,
                      offerCanonicalProductId: activeOffer?.canonicalProductId,
                      isVerifiedMatch: activeOffer?.isVerifiedMatch,
                      verificationSource: activeOffer?.verificationSource,
                      expectedBrand: p.brand,
                    });

                    return (
                      <td key={p.id} className="py-4 px-3">
                        {validated.isValid && validated.sanitizedUrl ? (
                          <a
                            href={validated.sanitizedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition active:scale-95 shadow-md shadow-rose-600/20 text-center"
                          >
                            <span>Visit {activeOffer?.sellerName || 'Store'}</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700 text-center select-none"
                            title="Product link unavailable"
                          >
                            <span>Product link unavailable</span>
                          </button>
                        )}
                        {activeOffer && (
                          <p className="text-[10px] text-slate-400 text-center mt-1">
                            Offer: {activeOffer.sellerName}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
