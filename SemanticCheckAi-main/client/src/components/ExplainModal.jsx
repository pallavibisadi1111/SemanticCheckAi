import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getClassificationBadgeClasses } from '../utils/formatters.js';

export default function ExplainModal({ match, onClose }) {
  if (!match) return null;

  const exp = match.explanation || {};
  const substitutions = exp.substitutions || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Why was this flagged?
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
          {/* Matched sentences snippet */}
          <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-700">Document A: </span>
              <span className="text-slate-900 font-normal">"{match.sentenceA}"</span>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-700">Document B: </span>
              <span className="text-slate-900 font-normal">"{match.sentenceB}"</span>
            </div>
          </div>

          {/* Section: What the system detected */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              What the system detected
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">Same core concept</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">Similar subject</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">Similar action</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">Similar outcome</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">Different vocabulary</span>
              </div>
              <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">Reworded structure</span>
              </div>
            </div>
          </div>

          {/* Metric Comparison */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-700">Semantic Similarity</div>
              <div className="text-xl font-black text-indigo-700 mt-0.5">{match.semanticScore}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-700">Lexical Similarity</div>
              <div className="text-xl font-black text-slate-800 mt-0.5">{match.lexicalScore}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-700">Classification</div>
              <div className="text-xs font-extrabold text-amber-900 mt-1.5 uppercase">
                {match.classification}
              </div>
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Plain English Explanation
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {exp.rationale || "Both sentences describe the same underlying idea and assertion. Although the wording is different, the underlying meaning is highly similar."}
            </p>
          </div>

          {/* Synonym Substitutions if any */}
          {substitutions.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Identified Word Substitutions
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {substitutions.slice(0, 6).map((sub, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900">
                    "{sub.from}" ↔ "{sub.to}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Recommendation</span>
            </h4>
            <p className="text-xs leading-relaxed font-medium">
              Review this passage manually before determining whether plagiarism occurred.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
