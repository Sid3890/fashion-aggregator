'use client';

import { useState } from 'react';
import { MyntraCrawlResponse, MyntraProduct } from '@fashion-aggregator/contracts';

interface MyntraLiveCrawlerProps {
  apiBaseUrl?: string;
  initialColor?: string;
  initialModel?: string;
  initialGender?: 'all' | 'men' | 'women' | 'kids';
}

const POPULAR_COLORS = ['Blue', 'Pink', 'Black', 'Green', 'Red', 'Yellow', 'White', 'Beige'];
const POPULAR_MODELS = ['Shirt', 'Kurti', 'T-shirt', 'Saree', 'Anarkali', 'Jeans', 'Jacket', 'Dress'];

export function MyntraLiveCrawler({
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
  initialColor = 'Blue',
  initialModel = 'Shirt',
  initialGender = 'all',
}: MyntraLiveCrawlerProps) {
  const [color, setColor] = useState(initialColor);
  const [model, setModel] = useState(initialModel);
  const [gender, setGender] = useState<'all' | 'men' | 'women' | 'kids'>(initialGender);
  const [limit, setLimit] = useState(20);

  const [loading, setLoading] = useState(false);
  const [crawlData, setCrawlData] = useState<MyntraCrawlResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const handleCrawl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!color.trim() || !model.trim()) {
      setError('Please provide both Color and Model/Clothing Type.');
      return;
    }

    setLoading(true);
    setError(null);
    const start = performance.now();

    try {
      const cleanUrl = apiBaseUrl.replace(/\/$/, '');
      const response = await fetch(`${cleanUrl}/crawl/myntra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: color.trim(),
          model: model.trim(),
          gender,
          limit,
        }),
      });

      const elapsed = Math.round(performance.now() - start);
      setElapsedMs(elapsed);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || `Server returned ${response.status} ${response.statusText}`);
      }

      const data: MyntraCrawlResponse = await response.json();
      setCrawlData(data);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setElapsedMs(elapsed);
      setError(err.message || 'Failed to crawl Myntra. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-rose-600">
              Live On-Demand Scraper
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Myntra Fashion Crawler
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Specify the garment color and model to scrape matching live products directly from Myntra.
          </p>
        </div>

        {/* Development Mode Notice */}
        <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium">
          📦 Image rendering disabled (No S3 setup required)
        </div>
      </div>

      {/* Input Parameters Form */}
      <form onSubmit={handleCrawl} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Color Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Pastel Pink, Blue, Black"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
            {/* Color Quick Chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {POPULAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Model / Garment Type Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              2. Clothing Model / Type
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Kurti, Shirt, Saree, Jeans"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
            {/* Model Quick Chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {POPULAR_MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                    model.toLowerCase() === m.toLowerCase()
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              3. Gender Filter
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">All / Any</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-2">Adds department prefix to query</p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg shadow-rose-600/30 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Crawling Myntra...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Scrape Myntra Now</span>
                </>
              )}
            </button>
            {elapsedMs !== null && !loading && (
              <span className="text-[11px] text-center text-slate-400 mt-2">
                Response received in {elapsedMs}ms
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Error alert */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {crawlData && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          {/* Metadata bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Crawled URL:
              </span>
              <a
                href={crawlData.myntraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-rose-600 hover:underline truncate max-w-xs sm:max-w-md"
              >
                {crawlData.myntraUrl}
              </a>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
              {crawlData.totalCountAvailable !== undefined && (
                <span>
                  Total available on Myntra:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {crawlData.totalCountAvailable.toLocaleString()}
                  </strong>
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                Showing {crawlData.resultsCount} items
              </span>
            </div>
          </div>

          {/* Product Boxes Grid (Without <img> tags, as requested) */}
          {crawlData.products.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p className="text-sm font-semibold">No products found on Myntra for this combination.</p>
              <p className="text-xs mt-1">Try a different color or clothing model.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {crawlData.products.map((item) => (
                <ProductBox key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Product Box component that intentionally excludes <img> tags as requested,
 * rendering clean, high-clarity product information with direct link button.
 */
function ProductBox({ product }: { product: MyntraProduct }) {
  return (
    <div className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-rose-400 dark:hover:border-rose-600 shadow-sm hover:shadow-md transition group">
      <div>
        {/* Brand & Stock Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 truncate">
            {product.brand}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            In Stock
          </span>
        </div>

        {/* Product Visual Indicator (SVG Garment Box instead of <img>) */}
        <div className="w-full h-24 mb-3 rounded-xl bg-gradient-to-br from-slate-100 to-rose-50/50 dark:from-slate-800 dark:to-slate-800/40 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-400 group-hover:text-rose-500 transition">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-[10px] font-medium tracking-tight mt-1 text-slate-500 dark:text-slate-400">
            {product.color || 'Fashion'} • {product.model || 'Style'}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed mb-2" title={product.title}>
          {product.title}
        </h3>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Price & Discount */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-black text-slate-900 dark:text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.mrp.toLocaleString('en-IN')}
            </span>
          )}
          {product.discount && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {product.discount}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating !== null && product.rating !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              ★ {product.rating}
            </span>
            {product.ratingCount !== null && product.ratingCount !== undefined && (
              <span className="text-[10px]">({product.ratingCount.toLocaleString()})</span>
            )}
          </div>
        )}

        {/* Outbound Link Button */}
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-center bg-slate-900 hover:bg-rose-600 text-white dark:bg-slate-800 dark:hover:bg-rose-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>View on Myntra</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
