import React from 'react';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';

export default function ErrorAlert({ title = 'Error', message, onRetry, onClose }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 text-left animate-in fade-in">
      <div className="flex items-start space-x-3.5">
        <div className="p-2 bg-red-100 rounded-xl text-red-600 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-red-900">{title}</h4>
          <p className="text-sm text-red-700 mt-1 leading-relaxed">{message}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 text-xs font-bold text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-600 p-1 rounded-lg focus:outline-none"
            aria-label="Dismiss alert"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
