import React, { useEffect, useState } from 'react';
import { Leaf, Cpu, Database, FileText, CheckCircle2 } from 'lucide-react';

export default function LoadingSpinner({ stage = 0 }) {
  const stages = [
    { label: 'Uploading leaf image...', icon: Leaf },
    { label: 'Preprocessing and resizing image...', icon: Cpu },
    { label: 'Running PyTorch AI model...', icon: Cpu },
    { label: 'Analyzing disease symptoms and confidence...', icon: Database },
    { label: 'Loading treatment recommendations...', icon: FileText },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => clearInterval(timer);
  }, [stages.length]);

  const activeIndex = Math.max(stage, currentStep);

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md max-w-md mx-auto text-center">
      <div className="relative w-16 h-16 mx-auto mb-5 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-emerald-100 animate-ping opacity-75"></div>
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md relative z-10">
          <Leaf className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">Analyzing Leaf Health</h3>
      <p className="text-xs text-slate-500 mb-6">
        Our deep-learning model is identifying pathology markers...
      </p>

      <div className="space-y-2.5 text-left">
        {stages.map((stg, idx) => {
          const Icon = stg.icon;
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div
              key={idx}
              className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                  : isDone
                  ? 'bg-slate-50 border-slate-200 text-slate-700 opacity-90'
                  : 'border-transparent text-slate-400 opacity-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs">{stg.label}</span>
              {isCurrent && (
                <div className="ml-auto w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
