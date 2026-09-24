import React, { useState } from 'react';
import { Sparkles, Play, CheckCircle2, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { runParaphraseTest } from '../services/api.js';

export default function ParaphraseTest() {
  const [original, setOriginal] = useState('Artificial intelligence is transforming education.');
  const [paraphrased, setParaphrased] = useState('AI is changing the way educational institutions teach and operate.');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTest = async (e) => {
    e?.preventDefault();
    if (!original.trim() || !paraphrased.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await runParaphraseTest(original, [
        { label: 'Paraphrased Sentence', text: paraphrased }
      ]);
      if (res && res.results && res.results[0]) {
        setResult(res.results[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to test similarity.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOriginal('Artificial intelligence is transforming education.');
    setParaphrased('AI is changing the way educational institutions teach and operate.');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Competition Demo Lab</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Paraphrase Test
        </h1>
        <p className="text-xs sm:text-sm text-slate-700">
          See how semantic detection works when the same idea is expressed using different words.
        </p>
      </div>

      {/* Test Form */}
      <form onSubmit={handleTest} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            ORIGINAL SENTENCE
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={2}
            className="w-full p-3 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            placeholder="Enter original sentence..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            PARAPHRASED SENTENCE
          </label>
          <textarea
            value={paraphrased}
            onChange={(e) => setParaphrased(e.target.value)}
            rows={2}
            className="w-full p-3 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            placeholder="Enter rewritten sentence..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Text</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || !original.trim() || !paraphrased.trim()}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isLoading ? 'Analyzing...' : 'Test Similarity'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Output */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Test Result
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] uppercase font-bold text-slate-700">Lexical Similarity</div>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {result.lexicalSimilarity < 30 ? 'LOW' : `${result.lexicalSimilarity}%`}
              </div>
              <div className="text-[11px] text-slate-700 mt-0.5">
                Exact word overlap ({result.lexicalSimilarity}%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200">
              <div className="text-[11px] uppercase font-bold text-indigo-800">Semantic Similarity</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {result.semanticSimilarity >= 60 ? 'HIGH' : `${result.semanticSimilarity}%`}
              </div>
              <div className="text-[11px] text-indigo-700 mt-0.5">
                Meaning alignment ({result.semanticSimilarity}%)
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Classification:</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Potential Semantic Match
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              "The wording is different, but the underlying meaning is similar."
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
