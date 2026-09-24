import React from 'react';
import { Printer, ArrowLeft, ShieldCheck, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { formatDate, getRiskBadgeClasses, getClassificationBadgeClasses } from '../utils/formatters.js';

export default function ReportsPage({ analysis, onBack }) {
  if (!analysis) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto">
        <h3 className="text-base font-bold text-slate-800">No active report generated</h3>
        <p className="text-xs text-slate-700 mt-1">
          Perform a document comparison to produce a formal academic investigation report.
        </p>
      </div>
    );
  }

  const { summary, counts, contentProfile, matches, documentA, documentB, timestamp, id } = analysis;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Action Bar (Hidden on print) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Formal Printable Document */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-sm space-y-8 print-card">
        {/* Academic Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-md bg-indigo-700 text-white flex items-center justify-center font-bold text-sm">
                S
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                SEMANTICHECK AI
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
              Semantic Plagiarism Analysis & Forensic Investigation Report
            </h1>
            <p className="text-xs text-slate-700">
              Department of Academic Integrity & Automated Forensics
            </p>
          </div>

          <div className="text-right text-xs text-slate-700 space-y-0.5">
            <div><strong>Report Ref:</strong> {id}</div>
            <div><strong>Generated:</strong> {formatDate(timestamp)}</div>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase bg-slate-100 border-slate-300 text-slate-800">
              Official Audit
            </div>
          </div>
        </div>

        {/* Compared Documents Box */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-700">Reference Source (Document A)</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm truncate">{documentA.name}</div>
            <div className="text-slate-700 mt-0.5">{documentA.sentenceCount} sentences • {documentA.wordCount} words</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-700">Evaluated Subject (Document B)</div>
            <div className="font-bold text-slate-900 mt-0.5 text-sm truncate">{documentB.name}</div>
            <div className="text-slate-700 mt-0.5">{documentB.sentenceCount} sentences • {documentB.wordCount} words</div>
          </div>
        </div>

        {/* Executive Forensic Verdict */}
        <div className="p-5 rounded-xl border-2 border-slate-900 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Executive Forensic Assessment
            </span>
            <span className={`px-3 py-1 rounded-full border text-xs font-black ${getRiskBadgeClasses(summary.riskLevel)}`}>
              {summary.status}
            </span>
          </div>

          <div className="flex items-baseline space-x-3 mt-2">
            <span className="text-4xl font-black text-slate-900">
              {summary.overallSemanticSimilarity}%
            </span>
            <span className="text-sm font-bold text-slate-700">
              Overall Semantic Similarity Score
            </span>
          </div>

          <p className="text-xs text-slate-800 leading-relaxed font-medium mt-1">
            <strong>Summary: </strong>{summary.statusMessage}
          </p>
        </div>

        {/* Forensic Metrics Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Quantitative Forensic Metrics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-700 text-[10px] uppercase font-bold">Semantic Similarity</div>
              <div className="text-xl font-bold text-indigo-700 mt-1">{summary.overallSemanticSimilarity}%</div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-700 text-[10px] uppercase font-bold">Lexical Similarity</div>
              <div className="text-xl font-bold text-slate-800 mt-1">{summary.overallLexicalSimilarity}%</div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-700 text-[10px] uppercase font-bold">Paraphrased Matches</div>
              <div className="text-xl font-bold text-amber-700 mt-1">{counts.paraphrasedMatches}</div>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="text-slate-700 text-[10px] uppercase font-bold">Exact / Near Matches</div>
              <div className="text-xl font-bold text-rose-700 mt-1">{counts.exactMatches + counts.nearMatches}</div>
            </div>
          </div>
        </div>

        {/* Content Profile Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Content Profile Composition
          </h3>
          <div className="flex text-xs font-semibold space-x-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>Original Content: <span className="text-emerald-700">{contentProfile.originalContent}%</span></div>
            <div>Semantic Overlap: <span className="text-indigo-700">{contentProfile.semanticOverlap}%</span></div>
            <div>Suspicious Paraphrase: <span className="text-amber-700">{contentProfile.suspiciousParaphrase}%</span></div>
            <div>Direct Overlap: <span className="text-rose-700">{contentProfile.directOverlap}%</span></div>
          </div>
        </div>

        {/* Most Suspicious Sentence Matches */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            Primary Flagged Sentence Matches Requiring Human Review
          </h3>

          <div className="space-y-4">
            {matches.slice(0, 8).map((match, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-800">
                    Flagged Item #{idx + 1}: Sentence A{match.sentenceAId} ↔ Sentence B{match.sentenceBId}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${getClassificationBadgeClasses(match.classification)}`}>
                      {match.classification}
                    </span>
                    <span className="font-bold text-indigo-700">
                      {match.semanticScore}% Match
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
                  <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-700 mb-1">
                      Document A (Reference)
                    </div>
                    <p className="leading-relaxed">"{match.sentenceA}"</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-700 mb-1">
                      Document B (Subject)
                    </div>
                    <p className="leading-relaxed">"{match.sentenceB}"</p>
                  </div>
                </div>

                {match.explanation?.rationale && (
                  <div className="text-[11px] text-slate-700 pt-1">
                    <strong className="text-slate-800">Forensic Audit Reason: </strong>
                    {match.explanation.rationale}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Responsible AI Notice & Sign-off Footer */}
        <div className="pt-6 border-t-2 border-slate-200 space-y-4 text-xs text-slate-700">
          <p className="leading-relaxed text-[11px]">
            <strong>Official Responsible AI Disclaimer: </strong>
            This automated forensic report identifies potential semantic plagiarism and paraphrased conceptual similarity using mathematical sentence embeddings. Automated scores are risk indicators and do not constitute legal or disciplinary proof of academic dishonesty. A qualified human investigator must evaluate the presence of appropriate scholarly citations, common discipline terminology, and syllabus guidelines.
          </p>

          <div className="grid grid-cols-2 gap-8 pt-8 text-xs">
            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Investigating Academic Officer</div>
              <div className="text-slate-700">Signature / Date</div>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900">Academic Review Committee Chair</div>
              <div className="text-slate-700">Signature / Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
