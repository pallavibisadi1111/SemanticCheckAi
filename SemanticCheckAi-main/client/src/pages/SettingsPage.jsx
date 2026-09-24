import React, { useState } from 'react';
import { Sliders, Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { getStoredSettings, saveStoredSettings } from '../services/historyStorage.js';

export default function SettingsPage({ thresholds, onUpdateThresholds }) {
  const [localSettings, setLocalSettings] = useState(thresholds || getStoredSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key, val) => {
    setLocalSettings({ ...localSettings, [key]: parseFloat(val) });
    setSavedSuccess(false);
  };

  const handleSave = () => {
    saveStoredSettings(localSettings);
    onUpdateThresholds(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    const defaults = {
      highSemantic: 0.80,
      suspiciousSemantic: 0.65,
      moderateSemantic: 0.50,
      exactLexical: 0.88,
      nearLexical: 0.70,
      paraphraseLexicalMax: 0.65,
    };
    setLocalSettings(defaults);
    saveStoredSettings(defaults);
    onUpdateThresholds(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">System Preferences</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Detection Thresholds & Sensitivity
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
            Fine-tune mathematical cutoff parameters for semantic embedding similarity and paraphrase flagging.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="inline-flex items-center space-x-1 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Threshold settings saved successfully and applied to future comparisons.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* High Semantic Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-900">
              High Risk Semantic Cosine Cutoff:
            </label>
            <span className="font-mono font-bold text-rose-600 text-sm">
              {Math.round(localSettings.highSemantic * 100)}% ({localSettings.highSemantic})
            </span>
          </div>
          <input
            type="range"
            min="0.60"
            max="0.95"
            step="0.01"
            value={localSettings.highSemantic}
            onChange={(e) => handleChange('highSemantic', e.target.value)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-700">
            Pairs meeting or exceeding this semantic score trigger automatic High Risk classification.
          </p>
        </div>

        {/* Suspicious Threshold */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-900">
              Suspicious Paraphrase Semantic Cutoff:
            </label>
            <span className="font-mono font-bold text-amber-600 text-sm">
              {Math.round(localSettings.suspiciousSemantic * 100)}% ({localSettings.suspiciousSemantic})
            </span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.80"
            step="0.01"
            value={localSettings.suspiciousSemantic}
            onChange={(e) => handleChange('suspiciousSemantic', e.target.value)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-700">
            Flags suspicious sentence rewrites where meaning is retained despite altered vocabulary.
          </p>
        </div>

        {/* Paraphrase Lexical Ceiling */}
        <div className="space-y-2 border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-900">
              Paraphrase Lexical Ceiling:
            </label>
            <span className="font-mono font-bold text-indigo-600 text-sm">
              {Math.round(localSettings.paraphraseLexicalMax * 100)}% ({localSettings.paraphraseLexicalMax})
            </span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.80"
            step="0.01"
            value={localSettings.paraphraseLexicalMax}
            onChange={(e) => handleChange('paraphraseLexicalMax', e.target.value)}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-700">
            Maximum direct word overlap allowed to classify a match as a paraphrase attack rather than an exact copy.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Threshold Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
