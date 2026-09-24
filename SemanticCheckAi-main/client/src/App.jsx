import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ComparePage from './pages/ComparePage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import ParaphraseTest from './pages/ParaphraseTest.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import {
  getHistory,
  saveAnalysisToHistory,
  deleteHistoryItem,
  clearAllHistory,
  getStoredSettings,
  saveStoredSettings
} from './services/historyStorage.js';
import { compareDocuments, compareMultipleDocs } from './services/api.js';
import { DEMO_COHORT_DOCUMENTS } from './data/sampleData.js';
import { formatDate, getRiskBadgeClasses } from './utils/formatters.js';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('overview'); // overview | compare | results | paraphrase | history | settings
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [thresholds, setThresholds] = useState(getStoredSettings());

  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [demoAnalysis, setDemoAnalysis] = useState(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleExploreDemo = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      if (demoAnalysis) {
        setIsDemoActive(true);
        setActiveAnalysis(demoAnalysis);
        setCurrentView('overview');
        return;
      }
      const result = await compareMultipleDocs({
        documents: DEMO_COHORT_DOCUMENTS
      });
      // Mark result and pair items as demo
      result.isDemo = true;
      if (result.comparisons) {
        result.comparisons.forEach((c) => {
          if (c.analysisData) c.analysisData.isDemo = true;
        });
      }
      setDemoAnalysis(result);
      setActiveAnalysis(result);
      setIsDemoActive(true);
      setCurrentView('overview');
    } catch (err) {
      console.error('Failed to run demo analysis:', err);
      setError(err.message || 'Failed to load demo analysis pipeline.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleRunComparison = async (params) => {
    setIsLoading(true);
    setError(null);
    setIsDemoActive(false);
    try {
      const result = await compareDocuments(params);
      setActiveAnalysis(result);
      const updatedHistory = saveAnalysisToHistory(result);
      if (updatedHistory) setHistory(updatedHistory);
      setCurrentView('results');
    } catch (err) {
      setError(err.message || 'Comparison failed. Please verify input files or text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunMultiComparison = async (validDocs) => {
    setIsLoading(true);
    setError(null);
    setIsDemoActive(false);
    try {
      const hasFiles = validDocs.some(d => Boolean(d.file));
      let payload;
      if (hasFiles) {
        payload = new FormData();
        validDocs.forEach((d) => {
          if (d.file) {
            payload.append('files', d.file);
          }
        });
      } else {
        payload = {
          documents: validDocs.map(d => ({ name: d.name, text: d.text }))
        };
      }

      const result = await compareMultipleDocs(payload);
      setActiveAnalysis(result);
      setCurrentView('results');
    } catch (err) {
      setError(err.message || 'Multi-document comparison failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnalysis = (analysis) => {
    setIsDemoActive(Boolean(analysis?.isDemo));
    setActiveAnalysis(analysis);
    setCurrentView('results');
  };

  const handleDeleteHistory = (id) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const getHeaderInfo = () => {
    switch (currentView) {
      case 'compare':
        return {
          title: 'Compare Documents',
          subtitle: 'Upload documents to check for semantic similarity and paraphrasing.'
        };
      case 'results':
        return {
          title: (isDemoActive || activeAnalysis?.isDemo) ? 'DEMO ANALYSIS' : 'Analysis Results',
          subtitle: activeAnalysis?.comparisons
            ? `Cohort Matrix (${activeAnalysis.totalDocuments} documents)`
            : activeAnalysis
            ? `${activeAnalysis.documentA?.name} vs ${activeAnalysis.documentB?.name}`
            : 'Forensic similarity investigation'
        };
      case 'paraphrase':
        return {
          title: 'Paraphrase Test',
          subtitle: 'See how semantic detection works when the same idea is expressed using different words.'
        };
      case 'history':
        return {
          title: 'Analysis History',
          subtitle: 'Review past document comparisons and forensic results.'
        };
      case 'reports':
        return {
          title: (isDemoActive || activeAnalysis?.isDemo) ? 'DEMO ANALYSIS REPORT' : 'Analysis Report',
          subtitle: (isDemoActive || activeAnalysis?.isDemo) ? 'Sample benchmark evaluation report.' : 'Formal academic plagiarism report.'
        };
      case 'settings':
        return {
          title: 'Settings & Sensitivity',
          subtitle: 'Configure similarity cutoffs.'
        };
      case 'overview':
      default:
        return {
          title: 'SemantiCheck AI',
          subtitle: 'Semantic Plagiarism Detection & Investigation'
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'reports' && !activeAnalysis && history.length > 0) {
            setActiveAnalysis(history[0].fullAnalysis);
          }
          setCurrentView(view);
        }}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenMobile={() => setMobileNavOpen(true)}
          onNewComparison={() => setCurrentView('compare')}
          hasActiveAnalysis={Boolean(activeAnalysis)}
          currentView={currentView}
          onBackToResults={() => setCurrentView('results')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentView === 'overview' && (
            <Dashboard
              history={history}
              demoAnalysis={demoAnalysis}
              isDemoActive={isDemoActive}
              onNewComparison={() => setCurrentView('compare')}
              onExploreDemo={handleExploreDemo}
              isDemoLoading={isDemoLoading}
              onSelectAnalysis={(selected) => {
                setActiveAnalysis(selected);
                setCurrentView('results');
              }}
              onDeleteHistory={handleDeleteHistory}
            />
          )}

          {currentView === 'compare' && (
            <ComparePage
              onRunComparison={handleRunComparison}
              onRunMultiComparison={handleRunMultiComparison}
              isLoading={isLoading}
              error={error}
              onClearError={() => setError(null)}
              thresholds={thresholds}
            />
          )}

          {currentView === 'results' && (
            <ResultsPage
              analysis={activeAnalysis}
              isDemoActive={isDemoActive || Boolean(activeAnalysis?.isDemo)}
              onNewComparison={() => setCurrentView('compare')}
              onInspectPair={(pairAnalysis) => {
                if (pairAnalysis) {
                  if (isDemoActive) pairAnalysis.isDemo = true;
                  setActiveAnalysis(pairAnalysis);
                  if (!isDemoActive) {
                    saveAnalysisToHistory(pairAnalysis);
                  }
                }
              }}
            />
          )}

          {currentView === 'paraphrase' && <ParaphraseTest />}

          {currentView === 'history' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Analysis History
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Saved investigation records from your current browser session.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all analysis history?')) {
                        clearAllHistory();
                        setHistory([]);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                          <th className="p-3.5 pl-5">Document A</th>
                          <th className="p-3.5">Document B</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Similarity</th>
                          <th className="p-3.5">Risk Level</th>
                          <th className="p-3.5 pr-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3.5 pl-5 font-semibold text-slate-900 truncate max-w-[180px]">
                              {item.docAName}
                            </td>
                            <td className="p-3.5 text-slate-700 truncate max-w-[180px]">
                              {item.docBName}
                            </td>
                            <td className="p-3.5 text-slate-700">
                              {formatDate(item.timestamp)}
                            </td>
                            <td className="p-3.5 font-bold text-indigo-700 text-sm">
                              {item.overallSemantic}%
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getRiskBadgeClasses(item.riskLevel)}`}>
                                {item.riskLevel}
                              </span>
                            </td>
                            <td className="p-3.5 pr-5 text-right space-x-2">
                              <button
                                onClick={() => handleSelectAnalysis(item.fullAnalysis)}
                                className="font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteHistory(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <h3 className="text-base font-bold text-slate-800">No analyses yet</h3>
                  <p className="text-xs text-slate-600">
                    Upload documents to perform your first comparison.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentView('compare')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Start New Comparison</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === 'reports' && (
            <ResultsPage
              analysis={activeAnalysis || (history.length > 0 ? history[0].fullAnalysis : null)}
              isDemoActive={isDemoActive || Boolean(activeAnalysis?.isDemo)}
              onNewComparison={() => setCurrentView('compare')}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              thresholds={thresholds}
              onUpdateThresholds={setThresholds}
            />
          )}
        </main>
      </div>
    </div>
  );
}
