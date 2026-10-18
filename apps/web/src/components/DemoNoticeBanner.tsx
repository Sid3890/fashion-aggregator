export function DemoNoticeBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-b border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white">
            Phase 1 UX Shell
          </span>
          <span className="font-medium">
            Indian Fashion Discovery & Price Comparison Prototype with deterministic seed catalog.
          </span>
        </div>
        <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80 flex items-center gap-3">
          <span>₹ Prices in integer minor units (paise)</span>
          <span>•</span>
          <span>Price Freshness Engine Active</span>
        </div>
      </div>
    </div>
  );
}
