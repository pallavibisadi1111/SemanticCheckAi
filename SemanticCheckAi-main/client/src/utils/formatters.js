/**
 * Helpers for formatting metrics, badges, and risk styling
 */

export function getRiskBadgeClasses(riskLevel = 'LOW') {
  switch (riskLevel?.toUpperCase()) {
    case 'HIGH':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
    case 'SUSPICIOUS':
      return 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20';
    case 'MODERATE':
      return 'bg-sky-50 text-sky-800 border-sky-200 ring-sky-500/20';
    case 'LOW':
    default:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
  }
}

export function getClassificationBadgeClasses(classification = '') {
  const norm = classification?.toLowerCase() || '';
  if (norm.includes('exact')) {
    return 'bg-rose-100 text-rose-800 border-rose-300';
  }
  if (norm.includes('near')) {
    return 'bg-orange-100 text-orange-800 border-orange-300';
  }
  if (norm.includes('paraphras')) {
    return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
  }
  if (norm.includes('semantic')) {
    return 'bg-indigo-100 text-indigo-800 border-indigo-300';
  }
  if (norm.includes('moderate')) {
    return 'bg-sky-100 text-sky-800 border-sky-300';
  }
  return 'bg-emerald-100 text-emerald-800 border-emerald-300';
}

export function getHeatmapCellColor(score = 0) {
  if (score >= 0.85) return 'bg-rose-600 text-white font-bold';
  if (score >= 0.70) return 'bg-amber-500 text-white font-semibold';
  if (score >= 0.55) return 'bg-amber-300 text-amber-950 font-medium';
  if (score >= 0.40) return 'bg-sky-200 text-sky-900';
  if (score >= 0.25) return 'bg-slate-100 text-slate-600';
  return 'bg-slate-50 text-slate-400';
}

export function formatPercent(num = 0) {
  return `${Math.round(num)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return 'Just now';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
