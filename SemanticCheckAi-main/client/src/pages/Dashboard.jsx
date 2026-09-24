import React from 'react';
import { motion } from 'motion/react';
import {
  PlusCircle,
  Play,
  ArrowRight,
  Clock,
  Trash2,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  FileText,
  AlertTriangle,
  Network,
  Grid,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { formatDate, getRiskBadgeClasses, getClassificationBadgeClasses } from '../utils/formatters.js';
import SemanticNetworkVisual from '../components/SemanticNetworkVisual.jsx';
import AnalysisWorkflowPipeline from '../components/AnalysisWorkflowPipeline.jsx';
import SemanticInvestigationGraph from '../components/SemanticInvestigationGraph.jsx';
import WhySemantiCheckSection from '../components/WhySemantiCheckSection.jsx';
import FingerprintChart from '../components/FingerprintChart.jsx';

export default function Dashboard({
  history = [],
  demoAnalysis = null,
  isDemoActive = false,
  onNewComparison,
  onExploreDemo,
  isDemoLoading = false,
  onSelectAnalysis,
  onDeleteHistory
}) {
  // Use either active demo analysis or most recent analysis from history
  const currentAnalysis = isDemoActive
    ? demoAnalysis
    : history.length > 0
    ? history[0].fullAnalysis
    : null;

  const isMulti = Boolean(currentAnalysis?.comparisons && currentAnalysis?.comparisons.length > 0);

  // Derive metrics
  const totalDocs = isMulti
    ? currentAnalysis.totalDocuments
    : currentAnalysis
    ? 2
    : 0;

  const totalPairs = isMulti
    ? currentAnalysis.totalPairs
    : currentAnalysis
    ? 1
    : 0;

  const highestSim = isMulti
    ? Math.max(...currentAnalysis.comparisons.map(c => c.semanticSimilarity || 0), 0)
    : currentAnalysis?.summary?.overallSemanticSimilarity || 0;

  const suspiciousPairsCount = isMulti
    ? currentAnalysis.comparisons.filter(c => c.riskLevel === 'HIGH' || c.riskLevel === 'SUSPICIOUS').length
    : currentAnalysis && (currentAnalysis.summary?.riskLevel === 'HIGH' || currentAnalysis.summary?.riskLevel === 'SUSPICIOUS')
    ? 1
    : 0;

  const comparisons = isMulti ? currentAnalysis.comparisons : [];
  const documents = isMulti ? currentAnalysis.documents : [];

  // Top 3 suspicious matches
  const topMatches = isMulti
    ? comparisons.slice(0, 3)
    : currentAnalysis?.matches?.slice(0, 3) || [];

  return (
    <motion.div
      className="space-y-8 max-w-6xl mx-auto py-3 sm:py-6 pb-20"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Hero: Semantic Investigation Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs relative overflow-hidden">
        {isDemoActive && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>DEMO ANALYSIS MODE</span>
            </span>
          </div>
        )}

        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Semantic Investigation Dashboard</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            SemantiCheck AI
          </h1>

          <h2 className="text-base sm:text-lg font-bold text-indigo-700">
            Semantic Plagiarism Detection & Investigation
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            "Detect the similarity. Understand the reason. Investigate the evidence."
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <motion.button
              onClick={onNewComparison}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Comparison</span>
            </motion.button>

            <motion.button
              onClick={onExploreDemo}
              disabled={isDemoLoading}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
              <span>{isDemoLoading ? 'Analyzing Sample...' : 'Explore Demo'}</span>
            </motion.button>
          </div>
        </div>

        {/* Animated Semantic Network Visual */}
        <div className="mt-8">
          <SemanticNetworkVisual />
        </div>
      </div>

      {/* When analysis exists (Demo or Real) */}
      {currentAnalysis ? (
        <div className="space-y-8">
          {/* Real Metrics Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {isDemoActive ? 'Demo Analysis Overview' : 'Active Investigation Metrics'}
              </span>
              {isDemoActive && (
                <span className="text-xs font-semibold text-slate-500">
                  Calculated from 4 benchmark sample documents
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="text-xs font-semibold text-slate-600">Documents Analyzed</div>
                <div className="text-3xl font-black text-slate-900 mt-2">{totalDocs}</div>
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
          </div>

          {/* Interactive Analysis Connection Workflow Pipeline */}
          <AnalysisWorkflowPipeline />

          {/* Multi-Document Similarity Matrix (Document Similarity Map) */}
          {isMulti && documents.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                    Document Similarity Map
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cross-document pairwise matrix. Click any percentage cell to inspect sentence-level matches.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Real Angular Cosine Scores
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="p-3 text-left font-bold text-slate-700">Document</th>
                      {documents.map((doc, idx) => (
                        <th key={idx} className="p-3 font-bold text-slate-800">
                          {doc.name.replace(/ \(.*\)/, '')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((docRow, i) => (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 text-left font-semibold text-slate-900">
                          {docRow.name}
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
                                onClick={() => onSelectAnalysis(pair?.analysisData)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-transform hover:scale-105 cursor-pointer shadow-xs ${
                                  sim >= 75
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                    : sim >= 60
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
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
          )}

          {/* Semantic Investigation Graph */}
          {isMulti && (
            <SemanticInvestigationGraph
              comparisons={comparisons}
              onOpenInvestigation={(pairAnalysis) => onSelectAnalysis(pairAnalysis)}
            />
          )}

          {/* Fingerprint Chart */}
          {currentAnalysis.contentProfile && (
            <FingerprintChart contentProfile={currentAnalysis.contentProfile} />
          )}

          {/* Top Suspicious Matches Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  Suspicious Matches Preview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top flagged passage pairs requiring human verification.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {isMulti ? (
                comparisons.slice(0, 3).map((pair, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">
                          {pair.docA} ↔ {pair.docB}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getRiskBadgeClasses(pair.riskLevel)}`}>
                          {pair.riskLevel} RISK
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Semantic Similarity: <strong className="text-indigo-700">{pair.semanticSimilarity}%</strong> • Paraphrased Match
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(pair.analysisData)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                topMatches.map((match, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">
                          Match #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getClassificationBadgeClasses(match.classification)}`}>
                          {match.classification}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 italic truncate max-w-xl">
                        "{match.sentenceA}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectAnalysis(currentAnalysis)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Why SemantiCheck AI Educational Section */}
          <WhySemantiCheckSection />
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No analyses yet</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Start a comparison or explore the demo to see how SemantiCheck AI works.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onNewComparison}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Comparison</span>
            </button>

            <button
              onClick={onExploreDemo}
              disabled={isDemoLoading}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
              <span>{isDemoLoading ? 'Analyzing Sample...' : 'Explore Demo'}</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
