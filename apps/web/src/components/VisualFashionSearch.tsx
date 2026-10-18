'use client';

import { useState } from 'react';
import { VisualSearchResponse, ScrapedProduct, FashionAttributes } from '@fashion-aggregator/contracts';

interface VisualFashionSearchProps {
  apiBaseUrl?: string;
  onSelectProduct?: (product: ScrapedProduct) => void;
}

const CURATED_SAMPLE_LOOKS = [
  {
    name: 'Royal Purple Silk Saree',
    file: 'purple-silk-saree.jpg',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
    hint: 'women',
  },
  {
    name: 'Indigo Blue Hand-Block Shirt',
    file: 'indigo-blue-shirt.jpg',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
    hint: 'men',
  },
  {
    name: 'Red Banarasi Silk Saree',
    file: 'red-banarasi-saree.jpg',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
    hint: 'women',
  },
  {
    name: 'Emerald Green Maxi Dress',
    file: 'emerald-green-dress.jpg',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80',
    hint: 'women',
  },
  {
    name: 'Classic Blue Relaxed Jeans',
    file: 'blue-denim-jeans.jpg',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
    hint: 'unisex',
  },
];

export function VisualFashionSearch({
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
}: VisualFashionSearchProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(CURATED_SAMPLE_LOOKS[0].image);
  const [fileName, setFileName] = useState<string>(CURATED_SAMPLE_LOOKS[0].file);
  const [departmentHint, setDepartmentHint] = useState<string>(CURATED_SAMPLE_LOOKS[0].hint);

  const [analyzing, setAnalyzing] = useState(false);
  const [searchResponse, setSearchResponse] = useState<VisualSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert and optimize uploaded file in canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        // Optimize in client canvas to ensure fast network transfer and crisp resolution
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.88);
            setPreviewUrl(optimizedBase64);
          } else {
            setPreviewUrl(rawDataUrl);
          }
          setSearchResponse(null);
          setError(null);
        };
        img.onerror = () => {
          setPreviewUrl(rawDataUrl);
          setSearchResponse(null);
          setError(null);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample preset look
  const handleSelectSample = (sample: typeof CURATED_SAMPLE_LOOKS[0]) => {
    setPreviewUrl(sample.image);
    setFileName(sample.file);
    setDepartmentHint(sample.hint);
    setSearchResponse(null);
    setError(null);
  };

  // Execute visual recognition and real-time retailer aggregation
  const handleSearch = async () => {
    if (!previewUrl) {
      setError('Please upload an outfit photo or select a sample look.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const payload: {
        imageBase64?: string;
        imageUrl?: string;
        fileName?: string;
        departmentHint?: string;
        stores: string[];
        limit: number;
      } = {
        fileName,
        departmentHint,
        stores: ['myntra'],
        limit: 20,
      };

      if (previewUrl.startsWith('http')) {
        payload.imageUrl = previewUrl;
      } else {
        payload.imageBase64 = previewUrl;
      }

      const cleanUrl = apiBaseUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/vision/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg =
          errJson.detail ||
          errJson.error?.message ||
          (errJson.invalidParams && errJson.invalidParams.map((p: any) => `${p.name}: ${p.reason}`).join(', ')) ||
          `Server error: HTTP ${res.status}`;
        throw new Error(errMsg);
      }

      const data: VisualSearchResponse = await res.json();
      setSearchResponse(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process visual search. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8">
      {/* Platform Core Feature Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-rose-100 to-amber-100 text-rose-800 dark:from-rose-950 dark:to-amber-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Core Platform Feature • Visual Fashion Intelligence Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Visual Search & Multi-Store Live Scraper
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload any outfit image. Our visual model detects the garment type, color palette, and pattern, then instantly scrapes and aggregates matching products from retailers across the internet.
          </p>
        </div>

        {/* Global Stores Status Chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active Scraper: Myntra (Live)</span>
        </div>
      </div>

      {/* Main Interactive Stage: Image Upload & Curated Looks */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Drag & Drop Upload Zone */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 rounded-3xl cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition p-4 text-center relative overflow-hidden group">
            {previewUrl ? (
              <div className="flex items-center gap-4 w-full h-full p-2">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-32 h-full object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="text-left flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600 block">
                    Source Outfit Image
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {fileName || 'Uploaded Garment'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Click to replace or drop another image
                  </p>
                  <span className="inline-block mt-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Ready to Analyze
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mb-2">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Drop outfit photo here or <span className="text-rose-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleSearch}
            disabled={analyzing || !previewUrl}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-xl shadow-rose-600/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Visual Recognition & Live Scraping...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Recognize Garment & Scrape Across Stores</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Curated Preset Looks */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Or test with sample ethnic and casual fashion looks:
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CURATED_SAMPLE_LOOKS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                    fileName === sample.file
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <img
                    src={sample.image}
                    alt={sample.name}
                    className="w-12 h-14 object-cover rounded-xl shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight">
                      {sample.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 mt-1 block">
                      {sample.hint}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Architecture Transparency Note */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold text-slate-800 dark:text-slate-200">System Flow: </span>
            The vision model decodes fashion attributes (garment cut, color, pattern, style) $\rightarrow$ dispatches parameters to retailer adapters $\rightarrow$ scrapes live products matching your look with verified buy links.
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Recognition Results & Scraped Products */}
      {searchResponse && (
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* 1. Visual Recognition Intelligence Card */}
          <div className="bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-indigo-50/40 dark:from-rose-950/40 dark:via-slate-800/60 dark:to-indigo-950/30 p-5 rounded-3xl border border-rose-200/60 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-600 text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-900 dark:text-white">
                  Visual AI Attributes Identified
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 shadow-xs">
                {Math.round(searchResponse.analysis.confidence * 100)}% Confidence
              </span>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Garment Type */}
              <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Garment Model
                </span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5 block truncate">
                  {searchResponse.analysis.garmentType}
                </span>
              </div>

              {/* Primary Color */}
              <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                    Identified Color
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block truncate">
                    {searchResponse.analysis.primaryColor}
                  </span>
                </div>
                <div
                  className="w-6 h-6 rounded-full border border-black/10 shadow-inner shrink-0"
                  style={{ backgroundColor: searchResponse.analysis.primaryColorHex }}
                  title={searchResponse.analysis.primaryColorHex}
                />
              </div>

              {/* Pattern & Style */}
              <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Pattern / Style
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block truncate">
                  {searchResponse.analysis.pattern}
                </span>
              </div>

              {/* Department & Fabric */}
              <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                  Department
                </span>
                <span className="text-sm font-black capitalize text-slate-900 dark:text-white mt-0.5 block truncate">
                  {searchResponse.analysis.department} Fashion
                </span>
              </div>
            </div>

            {searchResponse.analysis.explanation && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 italic">
                &ldquo;{searchResponse.analysis.explanation}&rdquo;
              </p>
            )}
          </div>

          {/* 2. Scraped Multi-Store Live Products Grid */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Live Aggregated Products
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {searchResponse.resultsCount} items found
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Queried: <strong>{searchResponse.storesQueried.join(', ')}</strong></span>
                {searchResponse.elapsedMs && (
                  <span>• in {searchResponse.elapsedMs}ms</span>
                )}
              </div>
            </div>

            {searchResponse.products.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No matching live products found for this garment style.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResponse.products.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-rose-400 dark:hover:border-rose-500 shadow-xs hover:shadow-md transition group"
                  >
                    <div>
                      {/* Store Provenance & In-Stock Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                          {item.store}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          In Stock
                        </span>
                      </div>

                      {/* Fashion Glyph Card (No <img> tag as requested) */}
                      <div className="w-full h-24 mb-3 rounded-xl bg-gradient-to-br from-slate-100 to-rose-50/40 dark:from-slate-800 dark:to-slate-800/40 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-400 group-hover:text-rose-500 transition">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                          {item.brand} • {item.garmentType || 'Style'}
                        </span>
                      </div>

                      <span className="text-xs font-black uppercase text-slate-900 dark:text-white truncate block">
                        {item.brand}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mt-1" title={item.title}>
                        {item.title}
                      </h4>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {/* Price & MRP */}
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                        {item.discount && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {item.discount}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {item.rating !== null && item.rating !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                            ★ {item.rating}
                          </span>
                          {item.ratingCount !== null && item.ratingCount !== undefined && (
                            <span className="text-[10px]">({item.ratingCount.toLocaleString()})</span>
                          )}
                        </div>
                      )}

                      {/* Direct Outbound Product Link */}
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-center bg-slate-900 hover:bg-rose-600 text-white dark:bg-slate-800 dark:hover:bg-rose-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>View on {item.store}</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
