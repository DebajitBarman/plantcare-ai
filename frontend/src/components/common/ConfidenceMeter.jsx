import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function ConfidenceMeter({ confidence = 0, level = 'High', showDetails = true }) {
  const percent = Math.round(confidence * 100);

  let colorClasses = {
    bg: 'bg-emerald-500',
    track: 'bg-emerald-100',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  };

  if (percent < 65 || level === 'Low') {
    colorClasses = {
      bg: 'bg-amber-500',
      track: 'bg-amber-100',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    };
  } else if (percent < 85 || level === 'Medium') {
    colorClasses = {
      bg: 'bg-blue-500',
      track: 'bg-blue-100',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Info className="w-4 h-4 text-blue-600" />,
    };
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Model Confidence
          </span>
          <span
            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold border ${colorClasses.badge}`}
          >
            {colorClasses.icon}
            <span>{level} ({percent}%)</span>
          </span>
        </div>
        <span className={`text-lg font-extrabold ${colorClasses.text}`}>{percent}%</span>
      </div>

      {/* Progress Bar Track */}
      <div className={`w-full h-3 rounded-full overflow-hidden ${colorClasses.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClasses.bg}`}
          style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex justify-between text-[11px] text-slate-500 pt-0.5 font-medium">
          <span>0%</span>
          <span>65% (Medium Threshold)</span>
          <span>85% (High Threshold)</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}
