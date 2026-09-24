import React, { useState } from 'react';
import { Files, UploadCloud, Play, AlertCircle, Trash2, ArrowRight, Eye } from 'lucide-react';
import { compareMultipleDocs } from '../services/api.js';
import { getRiskBadgeClasses } from '../utils/formatters.js';

export default function MultiDocPage({ onSelectPairAnalysis }) {
  const [docList, setDocList] = useState([
    {
      id: 'doc_1',
      name: 'Assignment_A_Pedagogy.txt',
      text: 'Online learning platforms provide students with flexibility by allowing them to access educational material from different locations and at different times. Personalized feedback helps students identify weaknesses.'
    },
    {
      id: 'doc_2',
      name: 'Assignment_B_DigitalEdu.txt',
      text: 'Digital education allows learners to study educational resources regardless of their location or schedule. Individualized feedback enables learners to recognize areas of weakness.'
    },
    {
      id: 'doc_3',
      name: 'Assignment_C_ClimateStudy.txt',
      text: 'Rapid climate change threatens global biodiversity by altering natural habitats and disrupting migration cycles of migratory species.'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAddDocument = () => {
    const nextNum = docList.length + 1;
    setDocList([
      ...docList,
      {
        id: `doc_${Date.now()}`,
        name: `Document_${nextNum}.txt`,
        text: ''
      }
    ]);
  };

  const handleRemoveDoc = (id) => {
    if (docList.length <= 2) return;
    setDocList(docList.filter(d => d.id !== id));
  };

  const handleTextChange = (id, newText) => {
    setDocList(docList.map(d => (d.id === id ? { ...d, text: newText } : d)));
  };

  const handleNameChange = (id, newName) => {
    setDocList(docList.map(d => (d.id === id ? { ...d, name: newName } : d)));
  };

  const handleRunPairwise = async () => {
    const validDocs = docList.filter(d => d.text.trim().length > 0);
    if (validDocs.length < 2) {
      setError('Please provide text for at least 2 documents.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await compareMultipleDocs({
        documents: validDocs.map(d => ({ name: d.name, text: d.text }))
      });
      setResults(res);
    } catch (err) {
      setError(err.message || 'Pairwise comparison failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Files className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Batch Investigation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Document Pairwise Comparison
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
            Compare an entire cohort or collection of documents to detect cross-collusion and shared plagiarism.
          </p>
        </div>

        <button
          onClick={handleRunPairwise}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isLoading ? 'Comparing Matrix...' : 'Run Pairwise Comparison'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Document Inputs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Cohort Documents ({docList.length})
          </h3>
          <button
            type="button"
            onClick={handleAddDocument}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Add Another Document
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docList.map((doc, idx) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <input
                  type="text"
                  value={doc.name}
                  onChange={(e) => handleNameChange(doc.id, e.target.value)}
                  className="font-bold text-xs text-slate-900 bg-transparent border-none focus:outline-hidden truncate max-w-[180px]"
                />
                {docList.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <textarea
                value={doc.text}
                onChange={(e) => handleTextChange(doc.id, e.target.value)}
                rows={4}
                className="w-full p-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden resize-none leading-relaxed"
                placeholder="Enter document text..."
              />
              <div className="text-[11px] text-slate-700 text-right">
                {doc.text.split(/\s+/).filter(Boolean).length} words
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Table */}
      {results && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-2">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Pairwise Similarity Matrix Results
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                Sorted by highest semantic risk level.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              {results.totalPairs} Pairs Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 pl-5">Document A</th>
                  <th className="p-3.5">Document B</th>
                  <th className="p-3.5">Semantic Similarity</th>
                  <th className="p-3.5">Lexical Overlap</th>
                  <th className="p-3.5">Paraphrase Likelihood</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5 pr-5 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.comparisons.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-semibold text-slate-900">
                      {c.docA}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {c.docB}
                    </td>
                    <td className="p-3.5 font-bold text-indigo-700 text-sm">
                      {c.semanticSimilarity}%
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      {c.lexicalSimilarity}%
                    </td>
                    <td className="p-3.5 font-medium text-amber-800">
                      {c.paraphraseLikelihood}%
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getRiskBadgeClasses(c.riskLevel)}`}>
                        {c.riskLevel}
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => onSelectPairAnalysis(c.analysisData)}
                        className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <span>Inspect Pair</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
