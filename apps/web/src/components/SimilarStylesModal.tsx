'use client';

import { Product } from '../types/catalog';
import { formatINR } from '@fashion-aggregator/domain';
import { validateOutboundUrl } from '../utils/outboundUrl';

interface SimilarStylesModalProps {
  referenceProduct: Product | null;
  allProducts: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProductToCompare: (product: Product) => void;
  onSelectSimilarProduct: (product: Product) => void;
}

export function SimilarStylesModal({
  referenceProduct,
  allProducts,
  isOpen,
  onClose,
  onSelectProductToCompare,
  onSelectSimilarProduct,
}: SimilarStylesModalProps) {
  if (!isOpen || !referenceProduct) return null;

  // Find similar items based on category, color similarity, or style keywords
  const similarProducts = allProducts
    .filter((p) => p.id !== referenceProduct.id)
    .map((p) => {
      let score = 70;
      const reasons: string[] = [];

      if (p.category === referenceProduct.category) {
        score += 15;
        reasons.push('Same Silhouette / Category');
      }
      if (p.color === referenceProduct.color) {
        score += 10;
        reasons.push('Matching Color Palette');
      }
      const sharedKeywords = p.styleKeywords.filter((k) =>
        referenceProduct.styleKeywords.includes(k)
      );
      if (sharedKeywords.length > 0) {
        score += Math.min(15, sharedKeywords.length * 5);
        reasons.push(`Shared: ${sharedKeywords.slice(0, 2).join(', ')}`);
      }

      return { product: p, score: Math.min(98, score), reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="similar-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </span>
              <h2 id="similar-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Similar Styles Discovery
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Finding aesthetic matches and alternative price points
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Honest Prototype Notice */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            <span className="text-indigo-900 dark:text-indigo-200">
              <strong className="font-semibold">Phase 1 Heuristic Recommendation:</strong> Deep vision embeddings (CLIP/SigLIP) & pgvector retrieval are scheduled for Phase 6. Displaying closest silhouette, fabric, and color matches.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-bold text-[10px] shrink-0">
            Preview
          </span>
        </div>

        {/* Reference Product Mini Bar */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-14 h-18 rounded-xl overflow-hidden bg-slate-200 shrink-0">
            <img
              src={referenceProduct.imageUrl}
              alt={referenceProduct.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-rose-600 uppercase">
              Target Reference Item
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {referenceProduct.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {referenceProduct.brand} • {referenceProduct.fabric} •{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {formatINR(referenceProduct.lowestPriceMinor)}
              </span>
            </p>
          </div>
        </div>

        {/* Similar Items List */}
        <div className="mt-4 flex-1 overflow-y-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Closest Visual & Style Matches in Catalog
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {similarProducts.map(({ product: p, score, reasons }) => (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 hover:border-rose-300 dark:hover:border-rose-900 transition"
              >
                <button
                  type="button"
                  onClick={() => onSelectSimilarProduct(p)}
                  className="w-20 h-26 rounded-xl overflow-hidden bg-slate-100 shrink-0 text-left hover:opacity-90 transition cursor-pointer"
                  title="Make this the reference item"
                >
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                </button>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-rose-600">{p.brand}</span>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {score}% Match
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectSimilarProduct(p)}
                      className="text-left cursor-pointer hover:text-rose-600 transition"
                    >
                      <h5 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {p.title}
                      </h5>
                    </button>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {formatINR(p.lowestPriceMinor)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {reasons.slice(0, 2).map((r, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Outbound Link or Unavailable State */}
                  {(() => {
                    const validated = validateOutboundUrl(p.offers[0]?.productUrl, {
                      canonicalProductId: p.id,
                      offerCanonicalProductId: p.offers[0]?.canonicalProductId,
                      isVerifiedMatch: p.offers[0]?.isVerifiedMatch,
                      verificationSource: p.offers[0]?.verificationSource,
                      expectedBrand: p.brand,
                    });
                    return (
                      <div className="mt-2 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => onSelectProductToCompare(p)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        >
                          + Compare
                        </button>
                        {validated.isValid && validated.sanitizedUrl ? (
                          <a
                            href={validated.sanitizedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <span>Visit Store</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                            Product link unavailable
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
