import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Cpu, FileSearch, Layers, Sparkles, FileText } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Extracting text and normalizing syntax...', icon: FileSearch },
  { id: 2, label: 'Segmenting sentence boundaries and tokens...', icon: Layers },
  { id: 3, label: 'Generating dense semantic embeddings (MiniLM)...', icon: Cpu },
  { id: 4, label: 'Computing sentence-to-sentence cosine similarity...', icon: Sparkles },
  { id: 5, label: 'Analyzing lexical divergence & paraphrase signals...', icon: FileSearch },
  { id: 6, label: 'Generating forensic investigation report...', icon: FileText },
];

export default function LoadingAnalysis() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-xl mx-auto my-12 text-center">
      <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <Loader2 className="w-8 h-8 text-indigo-600 animate-pulse" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
        Performing Semantic Plagiarism Analysis
      </h3>
      <p className="text-xs text-slate-700 mt-1 max-w-sm mx-auto">
        Evaluating conceptual similarity, paraphrasing structures, and lexical divergence.
      </p>

      {/* Progress Steps */}
      <div className="mt-8 space-y-3 text-left max-w-md mx-auto">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;

          return (
            <div
              key={stage.id}
              className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all ${
                isCurrent
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-medium'
                  : isDone
                  ? 'bg-slate-50/50 border-slate-200/60 text-slate-700'
                  : 'bg-transparent border-transparent text-slate-600 opacity-60'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <span className="text-xs">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-[11px] text-slate-700 font-medium">
        Running in-memory dense vector comparison • zero cloud data retention
      </div>
    </div>
  );
}
