import React, { useState } from 'react';
import { getRiskBadgeClasses } from '../utils/formatters.js';
import { ArrowRight, AlertCircle } from 'lucide-react';

export default function DocumentRiskMap({ riskMaps, onSelectSentence }) {
  const [activeDoc, setActiveDoc] = useState('documentA');

  if (!riskMaps || !riskMaps.documentA) {
    return null;
  }

  const currentList = activeDoc === 'documentA' ? riskMaps.documentA : riskMaps.documentB;

  const getBarColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-500 hover:bg-rose-600 border-rose-600';
      case 'SUSPICIOUS':
        return 'bg-amber-400 hover:bg-amber-500 border-amber-500';
      case 'MODERATE':
        return 'bg-sky-300 hover:bg-sky-400 border-sky-400';
      case 'LOW':
      default:
        return 'bg-emerald-400 hover:bg-emerald-500 border-emerald-500';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Document Risk Map
          </h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Sequential sentence risk topography. Click any sentence block to jump to the side-by-side comparison.
          </p>
        </div>

        {/* Document Selector */}
        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 text-xs font-medium border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveDoc('documentA')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeDoc === 'documentA'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Document A ({riskMaps.documentA.length} sentences)
          </button>
          <button
            type="button"
            onClick={() => setActiveDoc('documentB')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeDoc === 'documentB'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Document B ({riskMaps.documentB.length} sentences)
          </button>
        </div>
      </div>

      {/* Visual Density Ribbon */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="font-medium">Sentence Sequence Risk Density</span>
          <span>{currentList.length} Total Segments</span>
        </div>
        <div className="flex h-6 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 p-0.5 space-x-0.5">
          {currentList.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSentence(item.sentenceIndex)}
              className={`flex-1 h-full rounded-xs transition-transform hover:scale-105 ${getBarColor(
                item.riskLevel
              )}`}
              title={`Sentence ${idx + 1} (${item.maxSimilarity}%): ${item.classification}`}
            />
          ))}
        </div>
      </div>

      {/* Sentence Flow List */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {currentList.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectSentence(item.sentenceIndex)}
            className="group flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors"
          >
            <div className="shrink-0 pt-0.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                {idx + 1}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed group-hover:text-slate-900">
                "{item.text}"
              </p>
              <div className="mt-1.5 flex items-center space-x-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${getRiskBadgeClasses(item.riskLevel)}`}>
                  {item.maxSimilarity}% {item.riskLevel}
                </span>
                <span className="text-slate-700 font-medium">
                  {item.classification}
                </span>
              </div>
            </div>

            <div className="shrink-0 self-center text-slate-400 group-hover:text-indigo-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
