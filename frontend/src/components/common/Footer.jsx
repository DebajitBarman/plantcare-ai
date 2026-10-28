import React from 'react';
import { Leaf, ShieldAlert } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 pb-8 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-start">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                PlantCare <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-powered plant leaf disease detection and agricultural treatment assistant.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-400">
              <button onClick={() => setActivePage('detect')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Scan Leaf
              </button>
              <button onClick={() => setActivePage('library')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Disease Library
              </button>
              <button onClick={() => setActivePage('treatments')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Treatments & Products
              </button>
              <button onClick={() => setActivePage('history')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                Scan History
              </button>
              <button onClick={() => setActivePage('about')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                About & Help
              </button>
            </div>
          </div>

          {/* Advisory Notice */}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60 text-[11px] leading-relaxed text-slate-300">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Agricultural Advisory</span>
            </div>
            AI predictions provide immediate diagnostic guidance. For severe infestations, always confirm with local agricultural extension experts before applying chemical fungicides.
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} PlantCare AI. All rights reserved.</p>
          <p>Powered by PyTorch & FastAPI</p>
        </div>
      </div>
    </footer>
  );
}
