'use client';

import { useState } from 'react';
import { MyntraCrawlResponse, MyntraProduct } from '@fashion-aggregator/contracts';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyImageSearch?: (searchKeyword: string) => void;
  apiBaseUrl?: string;
}

const PRESET_SAMPLES = [
  {
    name: 'Pastel Pink Kurti',
    color: 'Pastel Pink',
    model: 'Kurti',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Indigo Blue Shirt',
    color: 'Blue',
    model: 'Shirt',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Red Banarasi Saree',
    color: 'Red',
    model: 'Saree',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Mustard Yellow Anarkali',
    color: 'Mustard Yellow',
    model: 'Anarkali',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Black Relaxed Jeans',
    color: 'Black',
    model: 'Jeans',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
  },
];

export function ImageSearchModal({
  isOpen,
  onClose,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',
}: ImageSearchModalProps) {
  // Input parameters (Development mode: skip image AI parsing and input directly)
  const [color, setColor] = useState('Pink');
  const [model, setModel] = useState('Kurti');
  const [gender, setGender] = useState<'all' | 'women' | 'men'>('all');

  // Scraping state
  const [crawling, setCrawling] = useState(false);
  const [results, setResults] = useState<MyntraCrawlResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCrawl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!color.trim() || !model.trim()) {
      setError('Please provide both color and clothing model.');
      return;
    }

    setCrawling(true);
    setError(null);

    try {
      const cleanUrl = apiBaseUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/crawl/myntra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: color.trim(),
          model: model.trim(),
          gender,
          limit: 16,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.detail || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data: MyntraCrawlResponse = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to crawl Myntra');
    } finally {
      setCrawling(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_SAMPLES[0]) => {
    setColor(preset.color);
    setModel(preset.model);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-search-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <div>
              <h2 id="image-search-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Live Myntra Style Scraper
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Input clothing style parameters (color & model) to scrape real-time matching products from Myntra.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Development Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <strong>Development Mode:</strong> Text parameters skip the image-to-garment vision model step. Third-party image rendering is omitted (no Amazon S3 required) while showing full product data and verified direct links.
        </div>

        {/* Quick Sample Looks to pre-fill */}
        <div className="mt-4">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Preset Looks:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_SAMPLES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handleSelectPreset(sample)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-rose-400 dark:hover:border-rose-500 text-slate-800 dark:text-slate-200 transition cursor-pointer"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleCrawl} className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Garment Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Pink, Blue, Black"
              className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Clothing Model / Type
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Kurti, Shirt, Jeans"
              className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Department
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="all">All / Any</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </div>

          <div className="sm:col-span-3 mt-1 flex justify-end gap-2">
            <button
              type="submit"
              disabled={crawling}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/30 flex items-center gap-2"
            >
              {crawling ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Scraping Myntra Live...</span>
                </>
              ) : (
                <span>Scrape Myntra for this Look</span>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Results Product Boxes */}
        {results && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Found {results.resultsCount} matching live items (from{' '}
                {results.totalCountAvailable?.toLocaleString() || 'all'} on Myntra)
              </span>
              <a
                href={results.myntraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-600 hover:underline font-mono"
              >
                Open Myntra Query ↗
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {results.products.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-rose-400 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400 truncate">
                        {item.brand}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        In Stock
                      </span>
                    </div>

                    {/* Garment Box Placeholder (No <img> tag) */}
                    <div className="h-16 mb-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400">
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item.color} • {item.model}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      {item.mrp > item.price && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{item.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                      {item.discount && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {item.discount}
                        </span>
                      )}
                    </div>

                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-center bg-slate-900 hover:bg-rose-600 text-white dark:bg-slate-700 dark:hover:bg-rose-600 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>View on Myntra</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
