import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { askAdvisory } from '../services/api';

export default function ContactHelp() {
  const { t } = useLanguage();

  const [question, setQuestion] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [loading, setLoading] = useState(false);
  const [advisoryResponse, setAdvisoryResponse] = useState(null);

  const sampleQuestions = [
    'My tomato leaves have brown circular spots with yellow rings. What should I check?',
    'Potato foliage is turning dark and collapsing after morning dew. What pathogen is likely?',
    'How do I control whiteflies without harming honeybees?',
    'What preventive fungicide should I spray before heavy monsoon rains?',
  ];

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAdvisoryResponse(null);
    try {
      const data = await askAdvisory(question.trim(), selectedCrop);
      setAdvisoryResponse(data);
    } catch (err) {
      setAdvisoryResponse({
        response: 'Unable to reach the advisory service. Please check your internet connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Agronomic Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Agricultural Advisory & Expert Help
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Ask questions grounded in our verified plant pathology knowledge base, or connect with agricultural extension specialists.
        </p>
      </div>

      {/* AI Agricultural Assistant Interactive Chat */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Verified Plant Health Assistant</h3>
            <span className="text-xs text-slate-500">
              Grounded in verified agronomic records (No hallucinated advice)
            </span>
          </div>
        </div>

        {/* Query Input */}
        <form onSubmit={handleAsk} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:w-44"
            >
              <option value="Tomato">Crop: Tomato</option>
              <option value="Potato">Crop: Potato</option>
              <option value="Corn">Crop: Corn</option>
              <option value="Apple">Crop: Apple</option>
              <option value="Grape">Crop: Grape</option>
              <option value="Pepper">Crop: Pepper</option>
            </select>

            <div className="relative flex-1">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about symptoms, treatments, or prevention practices..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Consult AI</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggested Queries */}
          <div className="flex flex-wrap gap-2 text-[11px] pt-1">
            <span className="text-slate-400 py-1">Try:</span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(sq)}
                className="bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-left"
              >
                {sq.length > 50 ? sq.substring(0, 50) + '...' : sq}
              </button>
            ))}
          </div>
        </form>

        {/* Advisory Response Display */}
        {advisoryResponse && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Agronomic Diagnostic Findings
              </span>
              <span className="text-[11px] text-slate-400">
                Source: {advisoryResponse.grounded_source}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {advisoryResponse.response}
            </div>

            {advisoryResponse.relevant_diseases?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-800 block mb-2">
                  Matching Disease Records in Database:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {advisoryResponse.relevant_diseases.map((rd, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1"
                    >
                      <strong className="text-slate-900 block">{rd.disease_name}</strong>
                      <span className="text-slate-500">{rd.treatment_summary}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extension Services & Emergency Hotlines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900">National Farmer Helpline</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Free toll-free agronomy extension helplines for urgent pest alerts and weather advisory.
          </p>
          <div className="text-xs font-mono font-bold text-emerald-700">
            Toll-Free: 1800-180-1551 (Kisan Call Center)
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Pathology Clinic Inquiries</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Submit photographic evidence or physical sample shipping requests to certified laboratories.
          </p>
          <div className="text-xs font-mono font-bold text-emerald-700">
            advisory@plantcare-ai.org
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Pesticide Safety Advisory</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Always observe maximum residue limits (MRL) and worker reentry protection intervals (REI).
          </p>
          <div className="text-xs text-slate-400">
            EPA / CIBRC Agricultural Standard
          </div>
        </div>
      </div>
    </div>
  );
}
