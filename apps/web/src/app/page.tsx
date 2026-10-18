'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { HealthResponse, HealthResponseSchema } from '@fashion-aggregator/contracts';
import { paiseToRupees } from '@fashion-aggregator/domain';
import { Product, FilterState } from '../types/catalog';
import { SEED_PRODUCTS } from '../data/seedProducts';
import { parseNaturalLanguageQuery, ParsedSearchIntent } from '../utils/searchParser';

// Components
import { DemoNoticeBanner } from '../components/DemoNoticeBanner';
import { Navbar } from '../components/Navbar';
import { HeroSearch } from '../components/HeroSearch';
import { CategoryNav } from '../components/CategoryNav';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductGrid } from '../components/ProductGrid';
import { ComparisonModal } from '../components/ComparisonModal';
import { SimilarStylesModal } from '../components/SimilarStylesModal';
import { ImageSearchModal } from '../components/ImageSearchModal';
import { HealthCheckModal } from '../components/HealthCheckModal';
import { MyntraLiveCrawler } from '../components/MyntraLiveCrawler';
import { VisualFashionSearch } from '../components/VisualFashionSearch';

type HealthStatus = 'checking' | 'healthy' | 'offline';
type ActiveView = 'visual' | 'crawler' | 'catalog';

export default function Home() {
  // 1. API Health Check State (Preserving Phase 0 functionality)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  const cleanBaseUrl = apiBaseUrl.replace(/\/$/, '');
  const healthEndpoint = `${cleanBaseUrl}/health`;

  const [healthStatus, setHealthStatus] = useState<HealthStatus>('checking');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setHealthStatus('checking');
    setErrorMsg(null);
    const start = performance.now();

    try {
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const parsed = HealthResponseSchema.parse(json);

      setHealthData(parsed);
      setHealthStatus('healthy');
      setLastChecked(new Date());
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setHealthStatus('offline');
      setHealthData(null);
      setLastChecked(new Date());

      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Unable to connect to the Express API server.');
      }
    }
  }, [healthEndpoint]);

  useEffect(() => {
    let ignore = false;

    async function initialCheck() {
      const start = performance.now();
      try {
        const response = await fetch(healthEndpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const elapsed = Math.round(performance.now() - start);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();
        const parsed = HealthResponseSchema.parse(json);

        if (!ignore) {
          setHealthData(parsed);
          setLatencyMs(elapsed);
          setHealthStatus('healthy');
          setLastChecked(new Date());
        }
      } catch (err: unknown) {
        const elapsed = Math.round(performance.now() - start);
        if (!ignore) {
          setLatencyMs(elapsed);
          setHealthStatus('offline');
          setHealthData(null);
          setLastChecked(new Date());
          setErrorMsg(err instanceof Error ? err.message : 'Unable to connect to Express API.');
        }
      }
    }

    initialCheck();

    return () => {
      ignore = true;
    };
  }, [healthEndpoint]);

  // 2. Search & Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    brands: [],
    priceRange: [0, 10000],
    colors: [],
    sizes: [],
    sortBy: 'featured',
  });

  // 3. Modals & Interactive UI State
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [referenceProductForSimilar, setReferenceProductForSimilar] = useState<Product | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);
  const [isImageSearchModalOpen, setIsImageSearchModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('visual');

  // 4. Natural Language Parser Intent
  const parsedIntent: ParsedSearchIntent = useMemo(() => {
    return parseNaturalLanguageQuery(filters.searchQuery);
  }, [filters.searchQuery]);

  // Synchronize search query without polluting manual filter state
  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      brands: [],
      priceRange: [0, 10000],
      colors: [],
      sizes: [],
      sortBy: 'featured',
    });
  };

  // 5. Compare Drawer Controls
  const handleToggleCompare = (product: Product) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 products at a time.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
  };

  // 6. Similar Styles Controls
  const handleFindSimilar = (product: Product) => {
    setReferenceProductForSimilar(product);
    setIsSimilarModalOpen(true);
  };

  // 7. Computed Filtering and Sorting
  const filteredProducts = useMemo(() => {
    return SEED_PRODUCTS.filter((product) => {
      // 1. Category Filter:
      // Manual selection strictly overrides parsed intent
      if (filters.category !== 'All') {
        if (product.category !== filters.category) return false;
      } else if (parsedIntent.category) {
        if (product.category !== parsedIntent.category) return false;
      } else if (parsedIntent.flexibleCategories && parsedIntent.flexibleCategories.length > 0) {
        if (!parsedIntent.flexibleCategories.includes(product.category)) return false;
      }

      // 2. Brand Filter:
      if (filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) return false;
      } else if (parsedIntent.brand) {
        if (product.brand.toLowerCase() !== parsedIntent.brand.toLowerCase()) return false;
      }

      // 3. Price Filter (in Rupees):
      const priceRupees = paiseToRupees(product.lowestPriceMinor);
      const effectiveMinPrice = Math.max(filters.priceRange[0], parsedIntent.minPriceRupees ?? 0);
      const effectiveMaxPrice = parsedIntent.maxPriceRupees
        ? Math.min(filters.priceRange[1], parsedIntent.maxPriceRupees)
        : filters.priceRange[1];

      if (priceRupees < effectiveMinPrice || priceRupees > effectiveMaxPrice) {
        return false;
      }

      // 4. Color Filter:
      if (filters.colors.length > 0) {
        if (!filters.colors.includes(product.color)) return false;
      } else if (parsedIntent.color) {
        const matchesColor =
          product.color.toLowerCase() === parsedIntent.color.toLowerCase() ||
          product.styleKeywords.includes(parsedIntent.color.toLowerCase()) ||
          product.title.toLowerCase().includes(parsedIntent.color.toLowerCase());
        if (!matchesColor) return false;
      }

      // 5. Size Filter:
      if (
        filters.sizes.length > 0 &&
        !filters.sizes.some((s) => product.availableSizes.includes(s))
      ) {
        return false;
      }

      // 6. Natural Language Search Keywords / Tokens:
      if (parsedIntent.searchTokens.length > 0) {
        const searchableCorpus = `${product.title} ${product.description} ${product.fabric} ${product.brand} ${product.category} ${product.color} ${product.tags.join(' ')} ${product.styleKeywords.join(' ')}`.toLowerCase();

        // Any descriptive token (e.g. "chikankari", "banarasi", "anarkali", "peplum", "cotton", "silk", "shirt") must match
        const unfulfilledTokens = parsedIntent.searchTokens.filter((token) => {
          if (parsedIntent.category && token === parsedIntent.category.toLowerCase()) return false;
          if (parsedIntent.color && parsedIntent.color.toLowerCase().includes(token)) return false;
          if (parsedIntent.brand && token === parsedIntent.brand.toLowerCase()) return false;
          return true;
        });

        for (const token of unfulfilledTokens) {
          if (!searchableCorpus.includes(token)) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.lowestPriceMinor - b.lowestPriceMinor;
        case 'price-desc':
          return b.lowestPriceMinor - a.lowestPriceMinor;
        case 'discount': {
          const discA = (a.originalPriceMinor - a.lowestPriceMinor) / a.originalPriceMinor;
          const discB = (b.originalPriceMinor - b.lowestPriceMinor) / b.originalPriceMinor;
          return discB - discA;
        }
        case 'rating':
          return b.rating - a.rating;
        case 'featured':
        default:
          return b.reviewCount - a.reviewCount;
      }
    });
  }, [filters, parsedIntent]);

  // 8. Available Filter Facets
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: SEED_PRODUCTS.length };
    SEED_PRODUCTS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    SEED_PRODUCTS.forEach((p) => {
      brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
    });
    return Array.from(brandMap.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, { hex: string; count: number }>();
    SEED_PRODUCTS.forEach((p) => {
      const existing = colorMap.get(p.color);
      if (existing) {
        existing.count += 1;
      } else {
        colorMap.set(p.color, { hex: p.colorHex, count: 1 });
      }
    });
    return Array.from(colorMap.entries()).map(([name, data]) => ({
      name,
      hex: data.hex,
      count: data.count,
    }));
  }, []);

  const availableSizes = useMemo(() => {
    const sizeMap = new Map<string, number>();
    SEED_PRODUCTS.forEach((p) => {
      p.availableSizes.forEach((s) => {
        sizeMap.set(s, (sizeMap.get(s) || 0) + 1);
      });
    });
    return Array.from(sizeMap.entries()).map(([name, count]) => ({ name, count }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Prototype Notice Banner */}
      <DemoNoticeBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar
        comparisonCount={comparedProducts.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenImageSearch={() => setActiveView('visual')}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        healthStatus={healthStatus}
        latencyMs={latencyMs}
      />

      {/* 3. Hero Section with Prominent Natural Language Search */}
      <HeroSearch
        searchQuery={filters.searchQuery}
        onSearchChange={handleSearchChange}
        parsedIntent={parsedIntent}
        onClearFilters={handleResetFilters}
        onOpenImageSearch={() => setActiveView('visual')}
      />

      {/* View Switcher: AI Visual Fashion Search vs Manual Parameter Scraper vs Curated Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl w-fit mx-auto sm:mx-0 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveView('visual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'visual'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>📷 AI Visual Recognition & Scraper</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 text-white font-semibold">
              Core Feature
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('crawler')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'crawler'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🕷️ Manual Parameter Scraper</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeView === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🛍️ Curated Aggregator Catalog</span>
          </button>
        </div>
      </div>

      {activeView === 'visual' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <VisualFashionSearch apiBaseUrl={cleanBaseUrl} />
        </main>
      ) : activeView === 'crawler' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MyntraLiveCrawler apiBaseUrl={cleanBaseUrl} />
        </main>
      ) : (
        <>
          {/* 4. Category Strip Navigation */}
          <CategoryNav
            selectedCategory={
              filters.category !== 'All'
                ? filters.category
                : parsedIntent.category ?? 'All'
            }
            onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
            categoryCounts={categoryCounts}
          />

          {/* 5. Main Catalog Content with Filter Sidebar and Product Grid */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8 items-start">
              {/* Left Filter Sidebar */}
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                availableBrands={availableBrands}
                availableColors={availableColors}
                availableSizes={availableSizes}
                totalResults={filteredProducts.length}
                isOpenMobile={isMobileFiltersOpen}
                onCloseMobile={() => setIsMobileFiltersOpen(false)}
              />

              {/* Product Grid */}
              <ProductGrid
                products={filteredProducts}
                comparedProducts={comparedProducts}
                onToggleCompare={handleToggleCompare}
                onFindSimilar={handleFindSimilar}
                filters={filters}
                onFilterChange={setFilters}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
                onResetFilters={handleResetFilters}
              />
            </div>
          </main>
        </>
      )}

      {/* 6. Floating Compare Dock (When items are selected) */}
      {comparedProducts.length > 0 && (
        <aside
          aria-label="Comparison dock"
          className="fixed bottom-6 right-6 z-30 flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/60 animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex -space-x-2 overflow-hidden">
            {comparedProducts.map((p) => (
              <img
                key={p.id}
                src={p.imageUrl}
                alt={p.title}
                className="inline-block h-10 w-8 rounded-lg object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
              />
            ))}
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              {comparedProducts.length} {comparedProducts.length === 1 ? 'item' : 'items'} selected
            </span>
            <span className="text-[10px] text-slate-500">Max 4 items</span>
          </div>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="ml-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition active:scale-95 cursor-pointer"
          >
            Compare Now
          </button>
        </aside>
      )}

      {/* 7. Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                VastraAI Discovery Platform
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 font-semibold">
                Phase 1 Shell
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsHealthModalOpen(true)}
                className="hover:text-rose-600 underline font-medium cursor-pointer"
              >
                Inspect Express API Health
              </button>
              <span>•</span>
              <span>Minor-Unit INR Pricing</span>
              <span>•</span>
              <span>Verified Brand Feeds</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
            Built as part of the Indian Fashion Discovery & Price-Comparison Monorepo specification. All demo items are clearly marked for testing purposes. Real catalogue ingestion, vector search, and authentication follow in subsequent phases.
          </p>
        </div>
      </footer>

      {/* 8. Modals */}
      <ComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={comparedProducts}
        onRemoveProduct={handleRemoveCompare}
        onClearAll={handleClearCompare}
      />

      <SimilarStylesModal
        referenceProduct={referenceProductForSimilar}
        allProducts={SEED_PRODUCTS}
        isOpen={isSimilarModalOpen}
        onClose={() => setIsSimilarModalOpen(false)}
        onSelectProductToCompare={(p) => {
          handleToggleCompare(p);
          setIsSimilarModalOpen(false);
          setIsCompareModalOpen(true);
        }}
        onSelectSimilarProduct={(p) => {
          setReferenceProductForSimilar(p);
        }}
      />

      <ImageSearchModal
        isOpen={isImageSearchModalOpen}
        onClose={() => setIsImageSearchModalOpen(false)}
        apiBaseUrl={cleanBaseUrl}
      />

      <HealthCheckModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        status={healthStatus}
        healthData={healthData}
        latencyMs={latencyMs}
        errorMsg={errorMsg}
        lastChecked={lastChecked}
        onRefresh={checkHealth}
      />
    </div>
  );
}
