import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  Download,
  Filter,
  Grid,
  Sparkles,
  Files,
  Printer,
  ChevronRight,
  X,
  AlertTriangle
} from 'lucide-react';
import SimilarityHeatmap from '../components/SimilarityHeatmap.jsx';
import ExplainModal from '../components/ExplainModal.jsx';
import { getClassificationBadgeClasses, getRiskBadgeClasses } from '../utils/formatters.js';

export default function ResultsPage({
  analysis,
  onNewComparison,
  onInspectPair,
  isDemoActive = false
}) {
  const isDemo = isDemoActive || Boolean(analysis?.isDemo);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'matches' | 'heatmap' | 'report'
  const [filterType, setFilterType] = useState('ALL');
  const [selectedMatchForExplain, setSelectedMatchForExplain] = useState(null);

  // Animated counter for similarity score
  const [animatedScore, setAnimatedScore] = useState(0);

  const isMultiDoc = Boolean(analysis?.comparisons && analysis?.comparisons.length > 0);

  useEffect(() => {
    if (!analysis) return;
    const target = isMultiDoc
      ? Math.max(...(analysis.comparisons || []).map(c => c.semanticSimilarity || 0), 0)
      : (analysis.summary?.overallSemanticSimilarity || 0);

    setAnimatedScore(0);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 25));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(interval);
      } else {
        setAnimatedScore(current);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [analysis, isMultiDoc]);

  if (!analysis) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto space-y-3">
        <h3 className="text-base font-bold text-slate-800">No active comparison result</h3>
        <p className="text-xs text-slate-600">
          Upload documents to view real similarity analysis and forensic breakdowns.
        </p>
        <button
          onClick={onNewComparison}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
        >
          Start New Comparison
        </button>
      </div>
    );
  }

  // =========================================================================
  // MULTI-DOCUMENT MATRIX RESULTS
  // =========================================================================
  if (isMultiDoc) {
    const { totalDocuments, totalPairs, documents = [], comparisons = [] } = analysis;
    const highestSim = Math.max(...comparisons.map(c => c.semanticSimilarity || 0), 0);
    const suspiciousPairsCount = comparisons.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'SUSPICIOUS').length;

    return (
      <motion.div
        className="space-y-6 max-w-5xl mx-auto pb-16"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-1">
              <Files className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isDemo ? 'DEMO ANALYSIS REPORT • Multi-Document Evaluation' : 'Multi-Document Evaluation'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isDemo ? 'DEMO ANALYSIS REPORT' : 'Cohort Similarity Matrix'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Pairwise cross-comparison across {totalDocuments} documents.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto no-print">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>
            <button
              onClick={onNewComparison}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <span>New Comparison</span>
            </button>
          </div>
        </div>

        {/* Comparison Overview 4-Card Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">Documents Analyzed</div>
            <div className="text-3xl font-black text-slate-900 mt-2">{totalDocuments}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">Pairs Compared</div>
            <div className="text-3xl font-black text-slate-900 mt-2">{totalPairs}</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">Highest Similarity</div>
            <div className="text-3xl font-black text-indigo-600 mt-2">{highestSim}%</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">Suspicious Pairs</div>
            <div className="text-3xl font-black text-rose-600 mt-2">{suspiciousPairsCount}</div>
          </div>
        </div>

        {/* Similarity Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pairwise Similarity Matrix
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Click any cell to open the detailed sentence-level investigation view.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-left font-bold text-slate-700">Document</th>
                  {documents.map((doc, idx) => (
                    <th key={idx} className="p-3 font-bold text-slate-700">
                      Doc {idx + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((docRow, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="p-3 text-left font-semibold text-slate-800">
                      Doc {i + 1} ({docRow.name})
                    </td>
                    {documents.map((docCol, j) => {
                      if (i === j) {
                        return (
                          <td key={j} className="p-3 font-mono text-slate-300">
                            —
                          </td>
                        );
                      }
                      const pair = comparisons.find(
                        c => (c.docA === docRow.name && c.docB === docCol.name) ||
                             (c.docA === docCol.name && c.docB === docRow.name)
                      );
                      const sim = pair?.semanticSimilarity || 0;

                      return (
                        <td key={j} className="p-2">
                          <button
                            type="button"
                            onClick={() => onInspectPair && onInspectPair(pair?.analysisData)}
                            className={`px-2.5 py-1.5 rounded-md font-bold text-xs transition-transform hover:scale-105 cursor-pointer ${
                              sim >= 75
                                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                : sim >= 60
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            title={`Inspect ${docRow.name} vs ${docCol.name} (${sim}%)`}
                          >
                            {sim}%
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Suspicious Pairs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Most Suspicious Pairs
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Ranked by highest conceptual overlap.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Document A</th>
                  <th className="p-3.5">Document B</th>
                  <th className="p-3.5">Similarity %</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisons.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-slate-900 truncate max-w-[200px]">
                      {c.docA}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 truncate max-w-[200px]">
                      {c.docB}
                    </td>
                    <td className="p-3.5 font-bold text-indigo-700 text-sm">
                      {c.semanticSimilarity}%
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getRiskBadgeClasses(c.riskLevel)}`}>
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => onInspectPair && onInspectPair(c.analysisData)}
                        className="inline-flex items-center space-x-1 font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <span>Investigate Match</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // TWO-DOCUMENT DETAILED RESULTS
  // =========================================================================
  const { summary, counts, contentProfile, matches = [], heatmapMatrix, documentA, documentB } = analysis;

  const filteredMatches = matches.filter((m) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'EXACT') return m.classification.toLowerCase().includes('exact') || m.classification.toLowerCase().includes('near');
    if (filterType === 'SEMANTIC') return m.classification.toLowerCase().includes('semantic') && !m.classification.toLowerCase().includes('paraphras');
    if (filterType === 'PARAPHRASED') return m.classification.toLowerCase().includes('paraphras');
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 4 Simple Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex flex-wrap gap-1.5 no-print">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 'matches'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Suspicious Matches ({matches.length})
        </button>

        <button
          onClick={() => setActiveTab('heatmap')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 'heatmap'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Similarity Heatmap
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
            activeTab === 'report'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Analysis Report
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Top Score Banner: "How similar are these documents?" */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              How similar are these documents?
            </div>

            {/* Animated Score */}
            <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
              {animatedScore}%
            </div>

            <div className="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              {summary.status || `${summary.riskLevel} SIMILARITY`}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium">
              Potential suspicious similarity detected. Human review recommended.
            </p>
          </div>

          {/* Section: "What did we find?" */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              What did we find?
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-600">
                  Semantic Similarity
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-1">
                  {summary.overallSemanticSimilarity}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-600">
                  Direct / Near Matches
                </div>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {counts.exactMatches + counts.nearMatches}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-600">
                  Paraphrased Matches
                </div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {counts.paraphrasedMatches}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-semibold text-slate-600">
                  Low Similarity Content
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {contentProfile.originalContent}%
                </div>
              </div>
            </div>
          </div>

          {/* Section: "What does this result mean?" */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              What does this result mean?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The documents contain several passages with highly similar meaning even though some wording has been changed.
            </p>

            <div className="space-y-2 py-1">
              <div className="flex items-center space-x-2 text-xs text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Similar concepts detected</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Reworded sentences detected</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Some direct / near matches detected</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 font-medium">
              Review the highlighted matches below before making a plagiarism decision.
            </div>
          </div>

          {/* Section: "What would you like to do next?" */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              What would you like to do next?
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('matches')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <span>Review Suspicious Matches</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('heatmap')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                <Grid className="w-4 h-4 text-indigo-600" />
                <span>View Heatmap</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ================= TAB 2: SUSPICIOUS MATCHES ================= */}
      {activeTab === 'matches' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Suspicious Matches
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                We found {matches.length} passages that require closer review.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-hidden font-medium"
              >
                <option value="ALL">All Matches ({matches.length})</option>
                <option value="PARAPHRASED">Paraphrased Only</option>
                <option value="EXACT">Exact / Near Only</option>
                <option value="SEMANTIC">Semantic Only</option>
              </select>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            {filteredMatches.map((match, idx) => (
              <div
                key={match.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-extrabold text-xs text-slate-900 tracking-wider">
                    MATCH #{String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-700">
                      Semantic Similarity {match.semanticScore}%
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-600">
                      Match Type: <strong className="text-slate-900">{match.classification}</strong>
                    </span>
                  </div>
                </div>

                {/* Side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Document A (Reference)
                    </div>
                    <p className="text-slate-900 font-normal leading-relaxed">
                      "{match.sentenceA}"
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                      Document B (Subject)
                    </div>
                    <p className="text-slate-900 font-normal leading-relaxed">
                      "{match.sentenceB}"
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedMatchForExplain(match)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Why was this flagged?</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ================= TAB 3: HEATMAP ================= */}
      {activeTab === 'heatmap' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Similarity Heatmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              See where the strongest similarities occur across the two documents. Darker cells represent stronger semantic similarity.
            </p>
          </div>

          <SimilarityHeatmap
            matrix={heatmapMatrix}
            sentencesA={documentA.sentences}
            sentencesB={documentB.sentences}
            onExplainMatch={(m) => setSelectedMatchForExplain(m)}
          />
        </motion.div>
      )}

      {/* ================= TAB 4: REPORT ================= */}
      {activeTab === 'report' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {isDemo ? 'DEMO ANALYSIS REPORT' : 'Analysis Report'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {isDemo ? 'Sample benchmark investigation report preview.' : 'Official investigation record preview.'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>

          {/* Clean Academic Report Paper */}
          <div className="bg-white rounded-xl border border-slate-300 p-8 shadow-xs space-y-6 print-card">
            <div className="border-b border-slate-900 pb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                SemantiCheck AI • {isDemo ? 'DEMO ANALYSIS REPORT' : 'SEMANTIC PLAGIARISM INVESTIGATION REPORT'}
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-1">
                {isDemo ? 'DEMO ANALYSIS REPORT' : 'SEMANTIC PLAGIARISM INVESTIGATION REPORT'}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-600">Document A (Reference):</span>
                <div className="font-semibold text-slate-900">{documentA.name}</div>
              </div>
              <div>
                <span className="font-bold text-slate-600">Document B (Subject):</span>
                <div className="font-semibold text-slate-900">{documentB.name}</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Overall Semantic Sim</div>
                <div className="text-xl font-bold text-indigo-700 mt-0.5">{summary.overallSemanticSimilarity}%</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Risk Level</div>
                <div className="text-xl font-bold text-rose-600 mt-0.5">{summary.riskLevel}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Direct / Near Matches</div>
                <div className="text-xl font-bold text-slate-900 mt-0.5">{counts.exactMatches + counts.nearMatches}</div>
              </div>
              <div>
                <div className="text-slate-500 text-[10px] uppercase font-bold">Paraphrased Matches</div>
                <div className="text-xl font-bold text-amber-700 mt-0.5">{counts.paraphrasedMatches}</div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1">
                Key Findings (Flagged Passages Requiring Review)
              </h3>

              <div className="space-y-3">
                {matches.slice(0, 5).map((match, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between font-bold">
                      <span>Item #{idx + 1} ({match.classification})</span>
                      <span className="text-indigo-700">{match.semanticScore}% Semantic Similarity</span>
                    </div>
                    <p className="text-slate-800">
                      <strong>Doc A:</strong> "{match.sentenceA}"
                    </p>
                    <p className="text-slate-800">
                      <strong>Doc B:</strong> "{match.sentenceB}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-600">
              <strong>Recommendation: </strong>Potential semantic plagiarism — human review recommended.
            </div>
          </div>
        </motion.div>
      )}

      {/* Forensic Explanation Slide-over Modal */}
      {selectedMatchForExplain && (
        <ExplainModal
          match={selectedMatchForExplain}
          onClose={() => setSelectedMatchForExplain(null)}
        />
      )}
    </div>
  );
}
