import React from 'react';
import { motion } from 'motion/react';
import { FileText, Cpu, BrainCircuit, CheckCircle2 } from 'lucide-react';

export default function SemanticNetworkVisual() {
  const steps = [
    { label: 'Document', sub: 'Raw Text / PDF', icon: FileText },
    { label: 'Semantic AI', sub: 'Dense 384D Embeddings', icon: Cpu },
    { label: 'Meaning', sub: 'Context & Concepts', icon: BrainCircuit },
    { label: 'Similarity', sub: 'Cosine & Paraphrase', icon: CheckCircle2 }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-5 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between relative">
        {/* Animated Connecting Flow Line */}
        <div className="absolute left-6 right-6 top-6 h-0.5 bg-slate-200 -z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-400"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={idx}
              className="flex flex-col items-center text-center relative z-10 space-y-1.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.4 }}
            >
              <motion.div
                className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  {step.sub}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
