'use client';

type HealthStatus = 'checking' | 'healthy' | 'offline';

interface NavbarProps {
  comparisonCount: number;
  onOpenCompare: () => void;
  onOpenImageSearch: () => void;
  onOpenHealthModal: () => void;
  healthStatus: HealthStatus;
  latencyMs: number | null;
}

export function Navbar({
  comparisonCount,
  onOpenCompare,
  onOpenImageSearch,
  onOpenHealthModal,
  healthStatus,
  latencyMs,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-indigo-600 p-0.5 shadow-md shadow-rose-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-base bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
                व
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Vastra<span className="text-rose-600">AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 uppercase">
                Discovery
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Indian Fashion Aggregator & Multi-Store Price Comparison
            </p>
          </div>
        </div>

        {/* Quick Actions & Header Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Visual Search Button */}
          <button
            onClick={onOpenImageSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer"
            title="Search with image (Phase 6 Preview)"
          >
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden md:inline">Visual Search</span>
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold px-1 rounded">
              AI
            </span>
          </button>

          {/* Comparison Dock Trigger */}
          <button
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
              comparisonCount > 0
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 hover:bg-rose-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Compare</span>
            {comparisonCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-rose-600 text-[10px] font-bold">
                {comparisonCount}
              </span>
            )}
          </button>

          {/* Live API Health Chip */}
          <button
            onClick={onOpenHealthModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Inspect API health & contracts"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                healthStatus === 'healthy'
                  ? 'bg-emerald-500'
                  : healthStatus === 'checking'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="hidden sm:inline text-slate-700 dark:text-slate-300 font-medium">
              {healthStatus === 'healthy'
                ? `API Online (${latencyMs ?? 0}ms)`
                : healthStatus === 'checking'
                ? 'Checking API...'
                : 'API Offline'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
