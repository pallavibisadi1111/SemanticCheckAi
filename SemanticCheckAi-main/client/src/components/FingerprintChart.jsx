import React from 'react';

export default function FingerprintChart({ contentProfile }) {
  if (!contentProfile) return null;

  const original = contentProfile.originalContent ?? 0;
  const semantic = contentProfile.semanticOverlap ?? 0;
  const direct = contentProfile.directOverlap ?? 0;
  const paraphrase = contentProfile.suspiciousParaphrase ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
            Content Profile Fingerprint
          </h4>
          <p className="text-xs text-slate-700 mt-0.5">
            Decomposition of document compositional origin and overlap categories.
          </p>
        </div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="space-y-2">
        <div className="h-6 w-full rounded-lg overflow-hidden flex bg-slate-100 border border-slate-200 p-0.5 space-x-0.5">
          {original > 0 && (
            <div
              style={{ width: `${original}%` }}
              className="h-full bg-emerald-500 rounded-xs transition-all duration-500"
              title={`Original Content: ${original}%`}
            />
          )}
          {semantic > 0 && (
            <div
              style={{ width: `${semantic}%` }}
              className="h-full bg-indigo-500 rounded-xs transition-all duration-500"
              title={`Semantic Overlap: ${semantic}%`}
            />
          )}
          {paraphrase > 0 && (
            <div
              style={{ width: `${paraphrase}%` }}
              className="h-full bg-amber-500 rounded-xs transition-all duration-500"
              title={`Suspicious Paraphrase: ${paraphrase}%`}
            />
          )}
          {direct > 0 && (
            <div
              style={{ width: `${direct}%` }}
              className="h-full bg-rose-500 rounded-xs transition-all duration-500"
              title={`Direct/Exact Overlap: ${direct}%`}
            />
          )}
        </div>
      </div>

      {/* Numerical Metrics Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200/80">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-xs font-semibold text-emerald-950">Original Content</span>
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {original}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200/80">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
            <span className="text-xs font-semibold text-indigo-950">Semantic Overlap</span>
          </div>
          <div className="text-xl font-bold text-indigo-700 mt-1">
            {semantic}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span className="text-xs font-semibold text-amber-950">Suspicious Paraphrase</span>
          </div>
          <div className="text-xl font-bold text-amber-700 mt-1">
            {paraphrase}%
          </div>
        </div>

        <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200/80">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span className="text-xs font-semibold text-rose-950">Direct/Exact Overlap</span>
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">
            {direct}%
          </div>
        </div>
      </div>
    </div>
  );
}
