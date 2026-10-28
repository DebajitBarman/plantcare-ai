import React, { useState } from 'react';
import { Leaf, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'detect', label: 'Scan Leaf' },
    { id: 'library', label: 'Disease Library' },
    { id: 'treatments', label: 'Treatments & Products' },
    { id: 'history', label: 'Scan History' },
    { id: 'about', label: 'About & Help' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('detect')}
            className="flex items-center space-x-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1">
                PlantCare <span className="text-emerald-600 font-extrabold">AI</span>
              </span>
              <span className="block text-[11px] font-medium text-slate-500 -mt-1">
                Plant Disease Assistant
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  activePage === item.id
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavClick('detect')}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>New Scan</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                activePage === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
