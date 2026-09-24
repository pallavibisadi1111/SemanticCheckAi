import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Plus,
  Files,
  File
} from 'lucide-react';

export default function ComparePage({
  onRunComparison,
  onRunMultiComparison,
  isLoading,
  error,
  onClearError,
  thresholds
}) {
  const [compareMode, setCompareMode] = useState('two'); // 'two' | 'multi'

  // Two-document mode state
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [nameA, setNameA] = useState('Document A');
  const [nameB, setNameB] = useState('Document B');
  const [modeA, setModeA] = useState('upload'); // 'upload' | 'paste'
  const [modeB, setModeB] = useState('upload');

  // Multi-document mode state
  const [multiDocs, setMultiDocs] = useState([
    { id: 'm1', name: 'Document 1', file: null, text: '', mode: 'upload' },
    { id: 'm2', name: 'Document 2', file: null, text: '', mode: 'upload' }
  ]);

  // Loading progress steps
  const [progressStep, setProgressStep] = useState(1);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setProgressStep(1);
      timer = setInterval(() => {
        setProgressStep((prev) => (prev < 6 ? prev + 1 : prev));
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = (bytes / 1024).toFixed(1);
    if (kb > 1000) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  // 2-doc validation
  const hasA = Boolean(fileA || textA.trim());
  const hasB = Boolean(fileB || textB.trim());
  const isTwoReady = hasA && hasB;

  // Multi-doc validation
  const validMultiCount = multiDocs.filter(d => Boolean(d.file || d.text.trim())).length;
  const isMultiReady = validMultiCount >= 2;

  const handleAddMultiDoc = () => {
    const nextIdx = multiDocs.length + 1;
    setMultiDocs([
      ...multiDocs,
      { id: `m_${Date.now()}`, name: `Document ${nextIdx}`, file: null, text: '', mode: 'upload' }
    ]);
  };

  const handleRemoveMultiDoc = (id) => {
    if (multiDocs.length <= 2) return;
    setMultiDocs(multiDocs.filter(d => d.id !== id));
  };

  const handleUpdateMultiDoc = (id, updates) => {
    setMultiDocs(multiDocs.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const handleMultiFileUpload = (id, file) => {
    if (!file) return;
    handleUpdateMultiDoc(id, {
      file,
      name: file.name
    });
  };

  const handleSubmitTwo = (e) => {
    e.preventDefault();
    if (!isTwoReady || isLoading) return;

    onRunComparison({
      fileA,
      fileB,
      textA: fileA ? '' : textA,
      textB: fileB ? '' : textB,
      nameA: nameA || 'Document A',
      nameB: nameB || 'Document B',
      thresholds
    });
  };

  const handleSubmitMulti = (e) => {
    e.preventDefault();
    if (!isMultiReady || isLoading) return;

    const validDocs = multiDocs.filter(d => Boolean(d.file || d.text.trim()));
    onRunMultiComparison(validDocs);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 3-Step Progress Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto text-xs font-semibold">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]">
              1
            </span>
            <span>01 Add Documents</span>
          </div>

          <span className="text-slate-300">→</span>

          <div className={`flex items-center space-x-2 ${isLoading ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
              isLoading ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
            }`}>
              2
            </span>
            <span>02 Analyze</span>
          </div>

          <span className="text-slate-300">→</span>

          <div className="flex items-center space-x-2 text-slate-500">
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>03 Review Results</span>
          </div>
        </div>
      </div>

      {/* Comparison Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Compare Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Upload documents to check for semantic similarity and paraphrasing.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCompareMode('two')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              compareMode === 'two'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Two Documents
          </button>
          <button
            type="button"
            onClick={() => setCompareMode('multi')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              compareMode === 'multi'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Files className="w-3.5 h-3.5" />
            <span>Multiple Documents (2+)</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            onClick={onClearError}
            className="text-rose-600 hover:text-rose-800 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading ? (
        <motion.div
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-md mx-auto space-y-5 text-center"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-12 h-12 mx-auto rounded-full border-3 border-indigo-100 border-t-indigo-600 animate-spin" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Analyzing your documents
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Evaluating dense embeddings and sentence alignment.
            </p>
          </div>

          <div className="space-y-2.5 text-left text-xs text-slate-700 border-t border-slate-100 pt-4">
            <div className={`flex items-center space-x-2.5 ${progressStep >= 1 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {progressStep > 1 ? '✓' : '●'}
              </span>
              <span>Extracting text</span>
            </div>

            <div className={`flex items-center space-x-2.5 ${progressStep >= 2 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {progressStep > 2 ? '✓' : progressStep === 2 ? '●' : '○'}
              </span>
              <span>Splitting sentences</span>
            </div>

            <div className={`flex items-center space-x-2.5 ${progressStep >= 3 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {progressStep > 3 ? '✓' : progressStep === 3 ? '●' : '○'}
              </span>
              <span>Generating semantic embeddings</span>
            </div>

            <div className={`flex items-center space-x-2.5 ${progressStep >= 4 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {progressStep > 4 ? '✓' : progressStep === 4 ? '●' : '○'}
              </span>
              <span>Comparing semantic meaning</span>
            </div>

            <div className={`flex items-center space-x-2.5 ${progressStep >= 5 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {progressStep > 5 ? '✓' : progressStep === 5 ? '●' : '○'}
              </span>
              <span>Detecting paraphrases</span>
            </div>

            <div className={`flex items-center space-x-2.5 ${progressStep >= 6 ? 'text-emerald-700 font-semibold' : 'text-slate-600'}`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {progressStep >= 6 ? '●' : '○'}
              </span>
              <span>Preparing results</span>
            </div>
          </div>
        </motion.div>
      ) : compareMode === 'two' ? (
        /* ================= TWO DOCUMENTS MODE ================= */
        <form onSubmit={handleSubmitTwo} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DOCUMENT A */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-wider">
                    DOCUMENT A
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Original / Reference Document
                  </p>
                </div>

                <div className="inline-flex rounded-lg p-0.5 bg-slate-200 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setModeA('upload')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      modeA === 'upload'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeA('paste')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      modeA === 'paste'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                {modeA === 'upload' ? (
                  fileA ? (
                    <div className="p-6 bg-indigo-50/40 border-2 border-dashed border-indigo-200 rounded-xl text-center space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-white border border-indigo-200 mx-auto flex items-center justify-center text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm truncate max-w-xs mx-auto">
                        ✓ {fileA.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {formatFileSize(fileA.size)} • PDF/DOCX/TXT
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileA(null)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold pt-2 cursor-pointer"
                      >
                        [ Remove / Change ]
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 cursor-pointer bg-slate-50/40 hover:bg-white transition-colors text-center">
                      <UploadCloud className="w-8 h-8 text-indigo-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800">
                        Upload Document
                      </span>
                      <span className="text-[11px] text-slate-600 mt-1">
                        Supported: PDF • DOCX • TXT
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFileA(e.target.files[0]);
                            setNameA(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                  )
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col">
                    <textarea
                      value={textA}
                      onChange={(e) => setTextA(e.target.value)}
                      placeholder="Paste reference text here..."
                      rows={7}
                      className="w-full flex-1 p-3 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-sans"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-600">
                      <span>{countWords(textA)} words</span>
                      {textA && (
                        <button
                          type="button"
                          onClick={() => setTextA('')}
                          className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DOCUMENT B */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-wider">
                    DOCUMENT B
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Document to Compare
                  </p>
                </div>

                <div className="inline-flex rounded-lg p-0.5 bg-slate-200 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setModeB('upload')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      modeB === 'upload'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeB('paste')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      modeB === 'paste'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                {modeB === 'upload' ? (
                  fileB ? (
                    <div className="p-6 bg-indigo-50/40 border-2 border-dashed border-indigo-200 rounded-xl text-center space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-white border border-indigo-200 mx-auto flex items-center justify-center text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm truncate max-w-xs mx-auto">
                        ✓ {fileB.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        {formatFileSize(fileB.size)} • PDF/DOCX/TXT
                      </div>
                      <button
                        type="button"
                        onClick={() => setFileB(null)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold pt-2 cursor-pointer"
                      >
                        [ Remove / Change ]
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 cursor-pointer bg-slate-50/40 hover:bg-white transition-colors text-center">
                      <UploadCloud className="w-8 h-8 text-indigo-600 mb-2" />
                      <span className="text-xs font-bold text-slate-800">
                        Upload Document
                      </span>
                      <span className="text-[11px] text-slate-600 mt-1">
                        Supported: PDF • DOCX • TXT
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFileB(e.target.files[0]);
                            setNameB(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                  )
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col">
                    <textarea
                      value={textB}
                      onChange={(e) => setTextB(e.target.value)}
                      placeholder="Paste comparative student submission here..."
                      rows={7}
                      className="w-full flex-1 p-3 text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none font-sans"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-600">
                      <span>{countWords(textB)} words</span>
                      {textB && (
                        <button
                          type="button"
                          onClick={() => setTextB('')}
                          className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Helper Guidance Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Not sure what to upload?</span>
            </h4>
            <p className="leading-relaxed">
              Upload the document you want to use as the reference in <strong>Document A</strong>. Upload the document you want to check for similarity in <strong>Document B</strong>. The system will compare their content and identify suspicious similarities.
            </p>
          </div>

          {/* Large CTA Analyze Button */}
          <div className="text-center pt-2 space-y-2">
            <button
              type="submit"
              disabled={!isTwoReady || isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-10 py-3.5 rounded-xl text-base font-bold transition-all shadow-xs ${
                isTwoReady
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Analyze Documents</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {!isTwoReady && (
              <p className="text-xs text-slate-500">
                Please add both documents to continue.
              </p>
            )}
          </div>
        </form>
      ) : (
        /* ================= MULTIPLE DOCUMENTS MODE (2+) ================= */
        <form onSubmit={handleSubmitMulti} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Upload <strong>2 or more documents</strong> (PDF, DOCX, TXT) to generate a pairwise similarity matrix.
            </div>
            <button
              type="button"
              onClick={handleAddMultiDoc}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {multiDocs.map((doc, idx) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="font-extrabold text-xs text-slate-800">
                    Document {idx + 1}
                  </div>
                  {multiDocs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMultiDoc(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {doc.file ? (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg text-center space-y-1">
                    <File className="w-6 h-6 text-indigo-600 mx-auto" />
                    <div className="font-semibold text-slate-900 text-xs truncate">
                      {doc.file.name}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {formatFileSize(doc.file.size)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateMultiDoc(doc.id, { file: null })}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-4 cursor-pointer bg-slate-50/40 hover:bg-white text-center transition-colors">
                      <UploadCloud className="w-5 h-5 text-indigo-600 mb-1" />
                      <span className="text-[11px] font-bold text-slate-800">
                        Upload File
                      </span>
                      <span className="text-[10px] text-slate-600">
                        PDF • DOCX • TXT
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleMultiFileUpload(doc.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <div className="text-center text-[10px] text-slate-600 uppercase font-bold">
                      or paste text
                    </div>

                    <textarea
                      value={doc.text}
                      onChange={(e) => handleUpdateMultiDoc(doc.id, { text: e.target.value })}
                      placeholder="Paste text directly..."
                      rows={3}
                      className="w-full p-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden resize-none"
                    />
                    <div className="text-[10px] text-slate-600 text-right">
                      {countWords(doc.text)} words
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA for Multi Comparison */}
          <div className="text-center pt-4 space-y-2">
            <button
              type="submit"
              disabled={!isMultiReady || isLoading}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-10 py-3.5 rounded-xl text-base font-bold transition-all shadow-xs ${
                isMultiReady
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Analyze Multiple Documents ({validMultiCount} Ready)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {!isMultiReady && (
              <p className="text-xs text-slate-500">
                Please provide content for at least 2 documents to continue.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
