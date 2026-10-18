'use client';

import { HealthResponse } from '@fashion-aggregator/contracts';
import { formatINR, rupeesToPaise, calculateFreshness, DEFAULT_CURRENCY } from '@fashion-aggregator/domain';

type HealthStatus = 'checking' | 'healthy' | 'offline';

interface HealthCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: HealthStatus;
  healthData: HealthResponse | null;
  latencyMs: number | null;
  errorMsg: string | null;
  lastChecked: Date | null;
  onRefresh: () => void;
}

export function HealthCheckModal({
  isOpen,
  onClose,
  status,
  healthData,
  latencyMs,
  errorMsg,
  lastChecked,
  onRefresh,
}: HealthCheckModalProps) {
  if (!isOpen) return null;

  const sampleRupees = 1499;
  const samplePaise = rupeesToPaise(sampleRupees);
  const sampleFormattedINR = formatINR(samplePaise);
  const sampleFreshness = calculateFreshness('2026-10-16T12:00:00.000Z', new Date('2026-10-16T14:00:00.000Z'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-modal-title"
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 id="health-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Platform Architecture & API Diagnostics
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifying Express API, Zod schema contracts, and domain packages
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API Status Overview */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'healthy'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : status === 'checking'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'healthy' ? 'bg-emerald-500' : status === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              {status === 'healthy' ? 'API Online' : status === 'checking' ? 'Testing Connection...' : 'API Offline'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              http://localhost:4000/api/v1/health
            </span>
          </div>

          <button
            onClick={onRefresh}
            disabled={status === 'checking'}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 cursor-pointer"
          >
            {status === 'checking' ? 'Testing...' : 'Ping API'}
          </button>
        </div>

        {/* Health Data Grid */}
        {status === 'healthy' && healthData && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Response</span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {healthData.status.toUpperCase()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Service</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {healthData.service}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Latency</span>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {latencyMs ?? 0} ms
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Uptime</span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {Math.round(healthData.uptime)}s
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Validated Zod Payload (@fashion-aggregator/contracts)
              </span>
              <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto border border-slate-800 max-h-40">
                {JSON.stringify(healthData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {status === 'offline' && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">Express API Not Reachable</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{errorMsg}</p>
            <p className="text-xs text-slate-500 mt-2">
              Start API with <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">npm run dev:api</code> or <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">npm run dev</code>
            </p>
          </div>
        )}

        {/* Domain packages verification */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Shared Domain Packages Active
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white">@fashion-aggregator/domain</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Money: ₹{sampleRupees} = {samplePaise} paise ({sampleFormattedINR})
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Freshness status: <span className="text-emerald-600 font-medium">{sampleFreshness}</span> ({DEFAULT_CURRENCY})
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-900 dark:text-white">@fashion-aggregator/contracts</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Zod Schemas: HealthResponseSchema, ErrorResponseSchema, PaginationQuerySchema.
              </p>
            </div>
          </div>
        </div>

        {lastChecked && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-right">
            Last queried: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
