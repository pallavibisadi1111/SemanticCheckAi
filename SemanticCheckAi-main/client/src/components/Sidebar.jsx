import React from 'react';
import {
  Compass,
  PlusCircle,
  History,
  Sparkles,
  FileText,
  ShieldCheck,
  X
} from 'lucide-react';

export default function Sidebar({ currentView, onNavigate, mobileOpen, onCloseMobile }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'compare', label: 'New Comparison', icon: PlusCircle },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'paraphrase', label: 'Paraphrase Test', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div
            onClick={() => {
              onNavigate('overview');
              onCloseMobile();
            }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 tracking-tight text-base leading-tight">
                SemantiCheck <span className="text-indigo-600">AI</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Semantic Investigation Suite
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Tagline Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-800 text-[11px]">
              "Detect similarity by meaning, not just matching words."
            </div>
            <p className="text-[10px] text-slate-500">
              Academic Investigation Platform
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
