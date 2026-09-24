import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function WhySemantiCheckSection() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
          Why SemantiCheck AI?
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Traditional lexical matching vs. Deep semantic paraphrase detection.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traditional Checkers */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Traditional Matching
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
              "Same Words"
            </span>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed">
            Relies on verbatim character strings or exact n-gram overlap. Easily tricked by swapping words with synonyms or inverting sentence structure.
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Fails to flag sophisticated academic paraphrasing.</span>
          </div>
        </div>

        {/* SemantiCheck AI */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
              SemantiCheck AI
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
              "Same Meaning"
            </span>
          </div>

          <div className="text-xs text-indigo-950 leading-relaxed">
            Transforms text into 384-dimensional dense semantic vectors to mathematically evaluate the underlying thesis, concepts, and logical assertions.
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Accurately flags reworded content even when every word changes.</span>
          </div>
        </div>
      </div>

      {/* Concrete Example Showcase */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Evaluated Paraphrase Demonstration
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Original Sentence
            </span>
            <p className="text-slate-800 italic">
              "Students can improve their academic performance through personalized feedback."
            </p>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Paraphrased Sentence
            </span>
            <p className="text-slate-800 italic">
              "Individualized feedback helps learners achieve better academic results."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-slate-500">
              Lexical Overlap: <strong className="text-slate-800">18% (Low)</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Semantic Similarity: <strong className="text-indigo-700">91% (High)</strong>
            </span>
          </div>

          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            Meaning remained similar even though the wording changed.
          </span>
        </div>
      </div>
    </div>
  );
}
