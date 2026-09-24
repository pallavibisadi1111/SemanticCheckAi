import React from 'react';
import { Sparkles, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { getClassificationBadgeClasses, getRiskBadgeClasses } from '../utils/formatters.js';

export default function SentenceMatchCard({ match, onWhyFlagged, isSelected }) {
  if (!match) return null;

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        isSelected
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/10'
          : 'border-slate-200 hover:border-slate-300 shadow-xs'
      } overflow-hidden`}
    >
      {/* Match Header Bar */}
      <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-700">
            Pair #{match.sentenceAId} ↔ #{match.sentenceBId}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getClassificationBadgeClasses(
              match.classification
            )}`}
          >
            {match.classification}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${getRiskBadgeClasses(
              match.riskLevel
            )}`}
          >
            {match.riskLevel} RISK
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-700 font-medium">Semantic:</span>
            <span className="font-bold text-indigo-700">{match.semanticScore}%</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700 font-medium">Lexical:</span>
            <span className="font-bold text-slate-800">{match.lexicalScore}%</span>
          </div>

          <button
            type="button"
            onClick={() => onWhyFlagged(match)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Why was this flagged?</span>
          </button>
        </div>
      </div>

      {/* Side by Side Sentences */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Document A Sentence */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-700 tracking-wider">
            Document A (Sentence #{match.sentenceAId})
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
            "{match.sentenceA}"
          </p>
        </div>

        {/* Document B Sentence */}
        <div className="pt-3 md:pt-0 md:pl-4 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-700 tracking-wider">
            Document B (Sentence #{match.sentenceBId})
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
            "{match.sentenceB}"
          </p>
        </div>
      </div>

      {/* Rationale Snippet */}
      {match.explanation?.rationale && (
        <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-700">
          <span className="truncate max-w-xl">
            <strong className="text-slate-700">Signal: </strong>
            {match.explanation.rationale}
          </span>
          {match.explanation?.substitutions?.length > 0 && (
            <span className="text-indigo-600 font-medium shrink-0 ml-2">
              {match.explanation.substitutions.length} synonym swaps identified
            </span>
          )}
        </div>
      )}
    </div>
  );
}
