import React from 'react';
import { Leaf, Cpu, FileCode2, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function About({ setActivePage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          About PlantCare AI
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          AI-powered plant leaf disease detection and agricultural guidance assistant.
        </p>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-lg font-bold text-slate-900">How It Works</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          PlantCare AI uses deep convolutional neural networks (PyTorch) trained on thousands of plant foliage images to identify visual pathology markers. When you upload a leaf photo, the system preprocesses and normalizes the image, evaluates candidate diseases, calculates confidence, and pulls verified treatment recommendations from our agricultural database.
        </p>
      </div>

      {/* Model Integration Guide */}
      <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 sm:p-8 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-emerald-400" />
          <span>Using Your Own Trained PyTorch Model (.pt)</span>
        </h3>
        <p className="text-xs leading-relaxed text-slate-300">
          To connect your own trained model weights, place the file in:
        </p>
        <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-emerald-400 border border-slate-800">
          backend/models/disease_model.pt
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restart the backend server. The model loader will automatically detect your file, load it onto your CPU or GPU, and switch from simulation mode to live neural network predictions.
        </p>
      </div>

      {/* Helplines and Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Agricultural Extension Hotline</h4>
          <p className="text-xs text-slate-500">
            For urgent regional disease alerts and farm advice:
          </p>
          <div className="text-xs font-mono font-bold text-emerald-700">
            Toll-Free: 1800-180-1551
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Pathology Feedback</h4>
          <p className="text-xs text-slate-500">
            Report unusual diagnostic symptoms or laboratory confirmations:
          </p>
          <div className="text-xs font-mono font-bold text-emerald-700">
            support@plantcare-ai.org
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => setActivePage('detect')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          Scan a Leaf Now
        </button>
      </div>
    </div>
  );
}
