import React, { useState } from 'react';
import { UploadCloud, FileText, Trash2, Edit3, CheckCircle2 } from 'lucide-react';

export default function UploadPanel({
  label,
  file,
  text,
  onFileSelect,
  onTextChange,
  onFileRemove,
  placeholderText,
  documentTitle,
  onTitleChange
}) {
  const [activeTab, setActiveTab] = useState(file ? 'file' : text ? 'paste' : 'file');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      setActiveTab('file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            {label}
          </h3>
        </div>

        {/* Tab switch */}
        <div className="inline-flex rounded-lg p-0.5 bg-slate-200/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'file'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'paste'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Document Label/Name Field */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center space-x-2 text-xs">
        <span className="text-slate-700 font-medium">Label:</span>
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={`Name for ${label}`}
          className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 focus:outline-hidden font-medium"
        />
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        {activeTab === 'file' ? (
          <div className="flex-1 flex flex-col">
            {file ? (
              /* Selected File Preview Card */
              <div className="flex-1 flex flex-col justify-center items-center p-6 border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-white border border-indigo-200 shadow-xs flex items-center justify-center text-indigo-600 mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center max-w-full px-2">
                  <div className="font-semibold text-slate-900 text-sm truncate max-w-xs">
                    {file.name}
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5">
                    {formatBytes(file.size)} • {file.name.split('.').pop()?.toUpperCase()}
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-emerald-600 text-xs font-medium mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>File parsed & ready</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onFileRemove}
                  className="mt-4 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove file</span>
                </button>
              </div>
            ) : (
              /* Drag & Drop Area */
              <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex-1 flex flex-col justify-center items-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/60'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Drag and drop your document here
                </div>
                <div className="text-xs text-slate-700 mt-1">
                  or <span className="text-indigo-600 font-semibold underline underline-offset-2">browse from device</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-3 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                  Supported formats: PDF, DOCX, TXT (up to 15MB)
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          /* Paste Text Mode */
          <div className="flex-1 flex flex-col">
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={placeholderText || "Paste document text, research abstract, or assignment paragraphs here..."}
              className="flex-1 w-full min-h-[220px] p-3 text-xs sm:text-sm font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed font-sans"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-700">
              <span>
                {text ? `${text.trim().split(/\s+/).filter(Boolean).length} words • ${text.length} characters` : '0 words'}
              </span>
              {text && (
                <button
                  type="button"
                  onClick={() => onTextChange('')}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Clear text
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
