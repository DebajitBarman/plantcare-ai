import React, { useState } from 'react';
import { ShieldCheck, Sparkles, ArrowRight, MapPin, FileText, Info } from 'lucide-react';
import ImageUploader from '../components/detection/ImageUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import { predictLeaf } from '../services/api';

const CROPS = [
  'Potato',
  'Tomato',
  'Grape',
  'Bell Pepper',
  'Corn (Maize)',
  'Apple',
  'Strawberry',
  'Peach',
  'Cherry',
  'Orange',
  'Soybean',
  'Squash',
];

export default function Detection({ onScanComplete, defaultCrop = 'Potato' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [crop, setCrop] = useState(defaultCrop);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showExtraOptions, setShowExtraOptions] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or upload a leaf photograph before running analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStage(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (crop) {
      formData.append('crop', crop);
    }
    if (location.trim()) {
      formData.append('location', location.trim());
    }
    if (notes.trim()) {
      formData.append('notes', notes.trim());
    }

    try {
      const report = await predictLeaf(formData);
      setIsLoading(false);
      onScanComplete(report);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'An error occurred during diagnosis. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner stage={loadingStage} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Leaf Scanner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Upload Your Plant Leaf
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Get an immediate AI diagnosis, symptoms breakdown, and practical treatment plan.
        </p>
      </div>

      {error && (
        <ErrorAlert
          title="Diagnostic Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleAnalyze} className="space-y-6">
        {/* Upload Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          {/* Crop Selector with Quick-Select Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Plant / Crop Type
            </label>

            {/* Quick-tap Crop Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                { name: 'Potato', icon: '🥔' },
                { name: 'Tomato', icon: '🍅' },
                { name: 'Grape', icon: '🍇' },
                { name: 'Bell Pepper', icon: '🫑' },
                { name: 'Corn (Maize)', icon: '🌽' },
                { name: 'Apple', icon: '🍎' },
                { name: 'Strawberry', icon: '🍓' },
              ].map((item) => {
                const isSelected = crop === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setCrop(item.name)}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-400'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown for all supported crops */}
            <div className="relative">
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {CROPS.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Selected crop: <strong>{crop}</strong>. The AI will specifically diagnose diseases for this crop.
            </p>
          </div>

          {/* Leaf Dropzone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Leaf Photo
            </label>
            <ImageUploader
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              onError={setError}
            />
          </div>

          {/* Optional extra inputs toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowExtraOptions(!showExtraOptions)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{showExtraOptions ? 'Hide extra field details' : '+ Add location or field notes (Optional)'}</span>
            </button>

            {showExtraOptions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-3 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Farm or Region"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Notes / Symptoms</span>
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Spots after rain"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={!selectedFile}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-10 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all ${
              selectedFile
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md cursor-pointer hover:scale-[1.01]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Analyze Leaf</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
