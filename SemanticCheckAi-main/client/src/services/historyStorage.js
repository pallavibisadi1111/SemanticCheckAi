/**
 * LocalStorage management for analysis history and user settings
 */

const HISTORY_KEY = 'semanticheck_analysis_history';
const SETTINGS_KEY = 'semanticheck_settings';

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveAnalysisToHistory(analysis) {
  if (!analysis || !analysis.id) return;

  try {
    const current = getHistory();
    // Pre-empt duplicate
    const filtered = current.filter(item => item.id !== analysis.id);
    
    // Store full analysis for immediate reopening
    const entry = {
      id: analysis.id,
      timestamp: analysis.timestamp || new Date().toISOString(),
      docAName: analysis.documentA?.name || 'Document A',
      docBName: analysis.documentB?.name || 'Document B',
      overallSemantic: analysis.summary?.overallSemanticSimilarity || 0,
      overallLexical: analysis.summary?.overallLexicalSimilarity || 0,
      riskLevel: analysis.summary?.riskLevel || 'LOW',
      status: analysis.summary?.status || 'LOW SIMILARITY',
      suspiciousCount: analysis.counts?.totalSuspicious || 0,
      fullAnalysis: analysis
    };

    const updated = [entry, ...filtered].slice(0, 20); // Keep last 20 analyses
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save analysis to history', e);
  }
}

export function deleteHistoryItem(id) {
  try {
    const current = getHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item', e);
    return [];
  }
}

export function clearAllHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch (e) {
    console.error('Failed to clear history', e);
    return [];
  }
}

export function getStoredSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {
      highSemantic: 0.80,
      suspiciousSemantic: 0.65,
      moderateSemantic: 0.50,
      exactLexical: 0.88,
      nearLexical: 0.70,
      paraphraseLexicalMax: 0.65
    };
  } catch (e) {
    return {
      highSemantic: 0.80,
      suspiciousSemantic: 0.65,
      moderateSemantic: 0.50,
      exactLexical: 0.88,
      nearLexical: 0.70,
      paraphraseLexicalMax: 0.65
    };
  }
}

export function saveStoredSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
