'use client';

import { ParsedSearchIntent } from '../utils/searchParser';

interface HeroSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  parsedIntent: ParsedSearchIntent;
  onClearFilters: () => void;
  onOpenImageSearch: () => void;
}

const EXAMPLE_QUERIES = [
  'Find a pastel pink kurti under ₹1,500',
  'Banarasi silk saree under ₹5,000',
  'Mustard yellow anarkali under ₹1,500',
  'Blue shirt',
  'Indigo block print maxi dress',
  'Handcrafted juttis under ₹2,000',
];

export function HeroSearch({
  searchQuery,
  onSearchChange,
  parsedIntent,
  onClearFilters,
  onOpenImageSearch,
}: HeroSearchProps) {
  // Use controlled searchQuery as inputValue to ensure typing, clearing, and submitting are in sync
  const inputValue = searchQuery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(inputValue);
  };

  const handleSuggestionClick = (example: string) => {
    onSearchChange(example);
  };

  const handleClear = () => {
    onSearchChange('');
    onClearFilters();
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50/60 via-amber-50/30 to-transparent dark:from-rose-950/20 dark:via-slate-900/40 dark:to-transparent">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-rose-400/10 via-amber-300/10 to-indigo-400/10 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900 mb-4 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Multi-Store AI Fashion Comparison Engine
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Discover Authentic Indian Fashion{' '}
          <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
            Across Top Stores
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Compare prices, verified brand collections, and live stock across Myntra, Tata CLiQ Luxury, Ajio Luxe, Nykaa Fashion & direct brand stores.
        </p>

        {/* Prominent Natural-Language Search Box */}
        <form onSubmit={handleSubmit} className="mt-6 max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-rose-900/5 dark:shadow-black/40 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 transition focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent">
            {/* Search Icon */}
            <div className="pl-3 pr-2 text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Natural Language Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Find a pastel pink kurti under ₹1,500..."
              aria-label="Natural language fashion search"
              className="flex-1 bg-transparent px-2 py-2 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />

            {/* Clear Input Button */}
            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                aria-label="Clear search input"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Image Search Button inside Search Bar */}
            <button
              type="button"
              onClick={onOpenImageSearch}
              className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
              title="Upload image to search similar styles (Phase 6 Preview)"
              aria-label="Upload image to search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Primary Search Submit Button */}
            <button
              type="submit"
              className="ml-1 px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-md shadow-rose-600/30 transition active:scale-95 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Suggestion Quick Chips */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">
            Try asking:
          </span>
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              onClick={() => handleSuggestionClick(example)}
              className="text-xs px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition active:scale-95 cursor-pointer"
            >
              &ldquo;{example}&rdquo;
            </button>
          ))}
        </div>

        {/* Detected Natural-Language Intent Badges */}
        {parsedIntent.detectedFeatures.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs">
            <span className="font-semibold text-rose-800 dark:text-rose-300">
              AI Query Parser detected:
            </span>
            {parsedIntent.detectedFeatures.map((feat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs border border-rose-200 dark:border-rose-900/60"
              >
                {feat}
              </span>
            ))}
            <button
              onClick={handleClear}
              className="ml-2 text-rose-600 dark:text-rose-400 underline font-medium hover:text-rose-800 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
