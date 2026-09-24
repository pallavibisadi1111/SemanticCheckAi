import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Sparkles, ChevronRight, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { getClassificationBadgeClasses, getRiskBadgeClasses } from '../utils/formatters.js';

export default function SemanticInvestigationGraph({ comparisons = [], onOpenInvestigation }) {
  // Find primary high-similarity connections (e.g. >= 60%)
  const strongConnections = comparisons.filter(c => c.semanticSimilarity >= 60);
  const [selectedConnection, setSelectedConnection] = useState(
    strongConnections.length > 0 ? strongConnections[0] : (comparisons[0] || null)
  );

  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-0.5">
            <Network className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Semantic Investigation</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Document Relationship & Cluster Graph
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nodes represent evaluated texts; edges represent detected semantic similarity. Click any connection to inspect evidence.
          </p>
        </div>

        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          {comparisons.length} Total Pairwise Links
        </span>
      </div>

      {/* Visual Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {comparisons.map((c, idx) => {
          const isSelected = selectedConnection?.docA === c.docA && selectedConnection?.docB === c.docB;
          const isHigh = c.semanticSimilarity >= 75;

          return (
            <motion.div
              key={idx}
              onClick={() => setSelectedConnection(c)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/70'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Connection Bridge Graphic */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                    {c.docA.replace('Document ', '')}
                  </div>
                  <div className="h-0.5 w-6 bg-slate-300 relative flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </div>
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                    {c.docB.replace('Document ', '')}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getRiskBadgeClasses(c.riskLevel)}`}>
                  {c.riskLevel}
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {c.docA} ↔ {c.docB}
                </div>
                <div className="flex items-center justify-between text-[11px] mt-1">
                  <span className="text-slate-500">Semantic Similarity:</span>
                  <span className="font-bold text-indigo-700 text-xs">
                    {c.semanticSimilarity}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Connection Inspector Drawer */}
      {selectedConnection && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedConnection.docA}-${selectedConnection.docB}`}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Inspecting Evidence: {selectedConnection.docA} vs {selectedConnection.docB}
                </span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getRiskBadgeClasses(selectedConnection.riskLevel)}`}>
                  {selectedConnection.riskLevel} RISK
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpenInvestigation && onOpenInvestigation(selectedConnection.analysisData)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Sentence-Level Investigation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Semantic Similarity</div>
                <div className="text-lg font-black text-indigo-700 mt-0.5">{selectedConnection.semanticSimilarity}%</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Lexical Similarity</div>
                <div className="text-lg font-black text-slate-700 mt-0.5">{selectedConnection.lexicalSimilarity}%</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Paraphrase Likelihood</div>
                <div className="text-lg font-black text-amber-600 mt-0.5">{selectedConnection.paraphraseLikelihood}%</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Suspicious Matches</div>
                <div className="text-lg font-black text-rose-600 mt-0.5">{selectedConnection.suspiciousCount || 1}</div>
              </div>
            </div>

            {selectedConnection.analysisData?.matches && selectedConnection.analysisData.matches[0] && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  Primary Matched Sentence Pair:
                </div>
                <p className="text-slate-800 italic">
                  <strong>{selectedConnection.docA}:</strong> "{selectedConnection.analysisData.matches[0].sentenceA}"
                </p>
                <p className="text-slate-800 italic">
                  <strong>{selectedConnection.docB}:</strong> "{selectedConnection.analysisData.matches[0].sentenceB}"
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
