'use client';

import { FilterState } from '../types/catalog';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableBrands: { name: string; count: number }[];
  availableColors: { name: string; hex: string; count: number }[];
  availableSizes: { name: string; count: number }[];
  totalResults: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const PRICE_PRESETS: { label: string; range: [number, number] }[] = [
  { label: 'All Prices', range: [0, 10000] },
  { label: 'Under ₹1,500', range: [0, 1500] },
  { label: '₹1,500 - ₹3,000', range: [1500, 3000] },
  { label: '₹3,000 - ₹5,000', range: [3000, 5000] },
  { label: 'Above ₹5,000', range: [5000, 15000] },
];

export function FilterSidebar({
  filters,
  onFilterChange,
  availableBrands,
  availableColors,
  availableSizes,
  totalResults,
  isOpenMobile,
  onCloseMobile,
}: FilterSidebarProps) {
  const handleBrandToggle = (brand: string) => {
    const nextBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: nextBrands });
  };

  const handleColorToggle = (color: string) => {
    const nextColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFilterChange({ ...filters, colors: nextColors });
  };

  const handleSizeToggle = (size: string) => {
    const nextSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onFilterChange({ ...filters, sizes: nextSizes });
  };

  const handlePricePreset = (range: [number, number]) => {
    onFilterChange({ ...filters, priceRange: range });
  };

  const handleClearAll = () => {
    onFilterChange({
      ...filters,
      category: 'All',
      brands: [],
      priceRange: [0, 10000],
      colors: [],
      sizes: [],
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.brands.length > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000;

  const content = (
    <div className="space-y-6">
      {/* Header with Clear Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {totalResults} items matching
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2.5">
          Price Range (INR)
        </h3>
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isSelected =
              filters.priceRange[0] === preset.range[0] &&
              filters.priceRange[1] === preset.range[1];
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePricePreset(preset.range)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{preset.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {/* Custom Price Inputs */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-400">Min (₹)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={filters.priceRange[0]}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceRange: [Math.max(0, parseInt(e.target.value) || 0), filters.priceRange[1]],
                })
              }
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400">Max (₹)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={filters.priceRange[1]}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceRange: [filters.priceRange[0], Math.max(filters.priceRange[0], parseInt(e.target.value) || 10000)],
                })
              }
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2.5">
          Brands
        </h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {availableBrands.map((b) => {
            const isChecked = filters.brands.includes(b.name);
            return (
              <label
                key={b.name}
                className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(b.name)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                  />
                  <span>{b.name}</span>
                </div>
                <span className="text-[10px] text-slate-400">({b.count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Colour Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2.5">
          Colour
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((c) => {
            const isSelected = filters.colors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleColorToggle(c.name)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition cursor-pointer border ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold ring-1 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
                title={`${c.name} (${c.count})`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[11px]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-2.5">
          Size
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map((s) => {
            const isSelected = filters.sizes.includes(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSizeToggle(s.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Rail */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit sticky top-24 shadow-xs">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Filter Products</span>
                <button
                  onClick={onCloseMobile}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {content}
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={onCloseMobile}
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-rose-600 text-white text-center cursor-pointer shadow-md"
              >
                Show {totalResults} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
