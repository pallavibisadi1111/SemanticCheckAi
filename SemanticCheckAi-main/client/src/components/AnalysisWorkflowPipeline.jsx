import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Binary,
  Cpu,
  Sparkles,
  GitCompare,
  HelpCircle,
  FileCheck
} from 'lucide-react';

const STAGES = [
  {
    id: 'docs',
    name: 'DOCUMENTS',
    icon: FileText,
    desc: 'Ingests academic PDFs, DOCX essays, or raw text without formatting bias.'
  },
  {
    id: 'proc',
    name: 'TEXT PROCESSING',
    icon: Binary,
    desc: 'Cleans whitespace, handles academic abbreviations, and performs sentence boundary segmentation.'
  },
  {
    id: 'emb',
    name: 'SEMANTIC EMBEDDINGS',
    icon: Cpu,
    desc: 'Converts sentences into 384-dimensional dense vectors capturing thematic meaning.'
  },
  {
    id: 'sim',
    name: 'SIMILARITY ENGINE',
    icon: Sparkles,
    desc: 'Computes angular cosine distances and cross-sentence affinity matrices.'
  },
  {
    id: 'match',
    name: 'MATCH DETECTION',
    icon: GitCompare,
    desc: 'Identifies paraphrase attacks by detecting high semantic similarity alongside low lexical overlap.'
  },
  {
    id: 'exp',
    name: 'EXPLAINABILITY',
    icon: HelpCircle,
    desc: 'Audits synonym swaps, grammatical restructuring, and shared core concept signals.'
  },
  {
    id: 'rep',
    name: 'INVESTIGATION REPORT',
    icon: FileCheck,
    desc: 'Compiles court-ready forensic reports for institutional review.'
  }
];

export default function AnalysisWorkflowPipeline() {
  const [selectedStage, setSelectedStage] = useState(STAGES[2]); // default to Semantic Embeddings

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            How the Analysis Connects
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Interactive pipeline stages. Click any stage to inspect its forensic role.
          </p>
        </div>
      </div>

      {/* Horizontal Interactive Pipeline Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
        {STAGES.map((stg) => {
          const Icon = stg.icon;
          const isSelected = selectedStage.id === stg.id;

          return (
            <motion.button
              key={stg.id}
              type="button"
              onClick={() => setSelectedStage(stg)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between space-y-2 ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-[10px] font-extrabold tracking-tight text-slate-800 uppercase leading-tight">
                {stg.name}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Explanation Bar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStage.id}
          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start space-x-2.5"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              {selectedStage.name}:{' '}
            </span>
            <span className="text-slate-700 leading-relaxed font-medium">
              "{selectedStage.desc}"
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
