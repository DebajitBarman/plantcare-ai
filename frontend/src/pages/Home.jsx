import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Microscope,
  FileText,
  Activity,
  ChevronDown,
  Sun,
  Droplets,
  Sprout,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Home({ setActivePage, onQuickSelectCrop }) {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const supportedCrops = [
    { name: 'Tomato', count: '10 Diseases', color: 'from-red-500 to-rose-600', icon: '🍅' },
    { name: 'Potato', count: '3 Diseases', color: 'from-amber-600 to-yellow-700', icon: '🥔' },
    { name: 'Corn (Maize)', count: '4 Diseases', color: 'from-yellow-500 to-amber-600', icon: '🌽' },
    { name: 'Apple', count: '4 Diseases', color: 'from-emerald-500 to-teal-700', icon: '🍏' },
    { name: 'Grape', count: '4 Diseases', color: 'from-purple-600 to-indigo-700', icon: '🍇' },
    { name: 'Bell Pepper', count: '2 Diseases', color: 'from-green-600 to-emerald-700', icon: '🫑' },
    { name: 'Strawberry', count: '2 Diseases', color: 'from-rose-500 to-pink-600', icon: '🍓' },
    { name: 'Cherry', count: '2 Diseases', color: 'from-red-600 to-rose-800', icon: '🍒' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Photograph the Leaf',
      desc: 'Capture a crisp, well-lit photograph of the symptomatic plant leaf showing lesions or discoloration.',
      icon: Leaf,
    },
    {
      num: '02',
      title: 'Neural Vision Analysis',
      desc: 'Our PyTorch CNN model processes cell textures, necrotic patterns, and chlorotic pigmentation.',
      icon: Microscope,
    },
    {
      num: '03',
      title: 'Instant Diagnosis & Confidence',
      desc: 'Receive the exact detected disease, confidence percentage, severity score, and Grad-CAM attention heatmap.',
      icon: Activity,
    },
    {
      num: '04',
      title: 'Science-Backed Treatment',
      desc: 'Access verified cultural management, organic options, chemical fungicides, and recommended supplements.',
      icon: FileText,
    },
  ];

  const faqs = [
    {
      q: 'How does the AI identify plant diseases?',
      a: 'PlantCare AI uses a Convolutional Neural Network (CNN) trained on thousands of curated agricultural leaf images. It identifies subtle textural, geometric, and chromatic patterns unique to specific fungal spores, bacterial spots, and viral chlorosis.',
    },
    {
      q: 'Can this replace an agricultural extension officer or laboratory test?',
      a: 'PlantCare AI provides rapid field diagnostics and triage. While highly reliable for common foliar diseases, critical economic decisions or unusual symptoms should always be confirmed with an in-person agronomist or certified diagnostic clinic.',
    },
    {
      q: 'Does it work for organic and chemical farming?',
      a: 'Yes! Every diagnosis provides both organic/biological alternatives (e.g. Bacillus subtilis, copper octanoate, cold-pressed neem) and standard chemical fungicides with exact active ingredients and pre-harvest intervals.',
    },
    {
      q: 'What should I do if the diagnosis shows low confidence?',
      a: 'When an image is blurry, shadowed, or taken from too far away, confidence may be low. Take a close-up photo in indirect daylight against a plain background, or use our Agricultural Advisory search.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-300 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t('hero.tag')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              {t('hero.subtitle')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('detect')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all"
              >
                <span>{t('hero.ctaDetect')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePage('library')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-7 py-3.5 rounded-xl font-semibold text-base transition-colors"
              >
                <Search className="w-5 h-5 text-slate-500" />
                <span>{t('hero.ctaExplore')}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 38+ PlantVillage Diseases
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> PyTorch Neural Inference
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Verified Agronomic Care
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Step-by-Step Flow</h2>
          <h3 className="text-3xl font-extrabold text-slate-900">How PlantCare AI Works</h3>
          <p className="text-sm text-slate-500 mt-2">
            From raw leaf photo to complete agronomic prescription in under two seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-emerald-700/60 font-mono">{step.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Crops Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Supported Agriculture</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Major Monitored Crops</h3>
          </div>
          <button
            onClick={() => setActivePage('library')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Browse All Classes in Library</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {supportedCrops.map((crop, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (onQuickSelectCrop) onQuickSelectCrop(crop.name);
                setActivePage('detect');
              }}
              className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex items-center space-x-3.5"
            >
              <div className="text-3xl p-2 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform">
                {crop.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {crop.name}
                </h4>
                <span className="text-xs text-slate-500">{crop.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agronomic Best Practices Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-950/50 border border-emerald-500/40 px-3 py-1 rounded-full text-xs text-emerald-200 font-bold">
                <Sprout className="w-4 h-4 text-emerald-300" />
                <span>Integrated Pest Management (IPM)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-snug">
                Prevention is 10x More Effective Than Reactive Chemical Cures
              </h3>
              <p className="text-sm text-emerald-100 leading-relaxed max-w-xl">
                Most fungal blights require continuous leaf wetness to penetrate cellular epidermis. Drip watering, proper pruning, and routine scouting save crop yields and protect groundwater.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <button
                onClick={() => setActivePage('detect')}
                className="bg-white text-emerald-900 hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:scale-105 transition-all"
              >
                Scan Leaf Symptoms Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Frequently Asked Questions</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Crop Health & AI Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
