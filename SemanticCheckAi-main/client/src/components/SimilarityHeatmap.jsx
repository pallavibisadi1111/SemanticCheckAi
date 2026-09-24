import React, { useState } from 'react';
import { getHeatmapCellColor } from '../utils/formatters.js';
import { Sparkles, Eye, Info } from 'lucide-react';

export default function SimilarityHeatmap({ matrix, sentencesA, sentencesB, onExplainMatch }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!matrix || matrix.length === 0 || !matrix[0]) {
    return (
      <div className="p-8 text-center text-slate-700 text-sm bg-white rounded-xl border border-slate-200">
        No similarity matrix data available.
      </div>
    );
  }

  const numRows = matrix.length;
  const numCols = matrix[0].length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Sentence-to-Sentence Similarity Heatmap</span>
            <span className="text-xs font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              {numRows} × {numCols} Matrix
            </span>
          </h3>
          <p className="text-xs text-slate-700 mt-0.5">
            Cross-document semantic density matrix. Rows represent Document A sentences; columns represent Document B.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-700">
          <span className="text-[11px] font-medium mr-1 text-slate-700">Similarity:</span>
          <span className="inline-block w-4 h-4 rounded-xs bg-slate-100 border border-slate-200" title="< 40% Low"></span>
          <span className="inline-block w-4 h-4 rounded-xs bg-sky-200 border border-sky-300" title="40-55% Moderate"></span>
          <span className="inline-block w-4 h-4 rounded-xs bg-amber-300 border border-amber-400" title="55-70% Moderate-High"></span>
          <span className="inline-block w-4 h-4 rounded-xs bg-amber-500 border border-amber-600" title="70-85% Suspicious"></span>
          <span className="inline-block w-4 h-4 rounded-xs bg-rose-600 border border-rose-700" title="85%+ High"></span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Top-left empty spacer */}
            <div className="w-16 h-8 shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-700">
              A \ B
            </div>
            {/* Column Headers (Doc B sentences) */}
            <div className="flex space-x-1">
              {sentencesB.map((sB, j) => (
                <div
                  key={j}
                  className="w-11 h-8 shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-700 rounded-t-xs hover:bg-slate-100"
                  title={`Doc B Sentence ${j + 1}: "${sB.text}"`}
                >
                  B{j + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {matrix.map((row, i) => (
            <div key={i} className="flex items-center space-x-1 mt-1">
              {/* Row Header (Doc A sentence) */}
              <div
                className="w-16 h-10 shrink-0 flex items-center justify-end pr-2 text-[11px] font-bold text-slate-700 hover:text-indigo-600 cursor-pointer"
                title={`Doc A Sentence ${i + 1}: "${sentencesA[i]?.text}"`}
              >
                A{i + 1}
              </div>

              {/* Cells */}
              <div className="flex space-x-1">
                {row.map((cell, j) => {
                  const score = cell.semanticScore;
                  const isSelected = selectedCell && selectedCell.sentenceAIndex === i && selectedCell.sentenceBIndex === j;
                  const isHovered = hoveredCell && hoveredCell.sentenceAIndex === i && hoveredCell.sentenceBIndex === j;

                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setSelectedCell({
                        ...cell,
                        sentenceA: sentencesA[i]?.text,
                        sentenceB: sentencesB[j]?.text,
                        sentenceAId: i + 1,
                        sentenceBId: j + 1,
                      })}
                      onMouseEnter={() => setHoveredCell({
                        ...cell,
                        sentenceA: sentencesA[i]?.text,
                        sentenceB: sentencesB[j]?.text,
                      })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-11 h-10 shrink-0 rounded-md flex flex-col items-center justify-center text-[10px] transition-transform cursor-pointer border ${getHeatmapCellColor(
                        score
                      )} ${
                        isSelected
                          ? 'ring-2 ring-indigo-600 scale-105 z-10'
                          : 'border-white/20 hover:scale-105'
                      }`}
                      title={`A${i + 1} ↔ B${j + 1}: ${Math.round(score * 100)}%`}
                    >
                      <span className="font-bold leading-none">{Math.round(score * 100)}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Cell Inspector Panel */}
      {selectedCell ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Inspecting Cell: Sentence A{selectedCell.sentenceAId} ↔ Sentence B{selectedCell.sentenceBId}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {Math.round(selectedCell.semanticScore * 100)}% Semantic Match
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                {selectedCell.classification}
              </span>
            </div>

            <button
              onClick={() => onExplainMatch({
                sentenceA: selectedCell.sentenceA,
                sentenceB: selectedCell.sentenceB,
                sentenceAId: selectedCell.sentenceAId,
                sentenceBId: selectedCell.sentenceBId,
                semanticScore: Math.round(selectedCell.semanticScore * 100),
                lexicalScore: Math.round(selectedCell.lexicalScore * 100),
                structuralScore: Math.round(selectedCell.structuralScore * 100),
                classification: selectedCell.classification,
                riskLevel: selectedCell.riskLevel,
                badgeColor: selectedCell.badgeColor,
                description: selectedCell.classification
              })}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why was this flagged?</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-700 text-[10px] uppercase mb-1">
                Sentence A{selectedCell.sentenceAId}
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                "{selectedCell.sentenceA}"
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-700 text-[10px] uppercase mb-1">
                Sentence B{selectedCell.sentenceBId}
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                "{selectedCell.sentenceB}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Click any cell above to inspect the exact paired sentences and run a deep forensic explanation.</span>
        </div>
      )}
    </div>
  );
}
