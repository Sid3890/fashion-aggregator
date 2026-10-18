'use client';

import { Product, FilterState } from '../types/catalog';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  comparedProducts: Product[];
  onToggleCompare: (product: Product) => void;
  onFindSimilar: (product: Product) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onOpenMobileFilters: () => void;
  onResetFilters: () => void;
}

export function ProductGrid({
  products,
  comparedProducts,
  onToggleCompare,
  onFindSimilar,
  filters,
  onFilterChange,
  onOpenMobileFilters,
  onResetFilters,
}: ProductGridProps) {
  const isCompared = (productId: string) =>
    comparedProducts.some((p) => p.id === productId);

  return (
    <div className="flex-1 min-w-0">
      {/* Grid Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
          </button>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {filters.category === 'All' ? 'All Fashion Items' : `${filters.category} Collection`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{products.length}</span> curated items
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            <option value="featured">Featured / Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching items found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We could not find any items matching your active criteria. Try removing budget caps, adjusting color swatches, or resetting your query.
          </p>

          {/* Active Constraints Summary */}
          {(filters.searchQuery || filters.category !== 'All' || filters.colors.length > 0 || filters.priceRange[1] < 10000) && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              {filters.searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Search: &ldquo;{filters.searchQuery}&rdquo;
                </span>
              )}
              {filters.category !== 'All' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Category: {filters.category}
                </span>
              )}
              {filters.colors.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Color: {filters.colors.join(', ')}
                </span>
              )}
              {filters.priceRange[1] < 10000 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  Budget ≤ ₹{filters.priceRange[1].toLocaleString('en-IN')}
                </span>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        /* Responsive Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isCompared={isCompared(product.id)}
              onToggleCompare={onToggleCompare}
              onFindSimilar={onFindSimilar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
