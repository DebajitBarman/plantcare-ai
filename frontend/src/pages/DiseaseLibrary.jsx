import React, { useState, useEffect } from 'react';
import { Search, Leaf, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { getDiseases } from '../services/api';

const CROPS = ['All', 'Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Pepper', 'Cherry', 'Strawberry'];
const SEVERITIES = ['All', 'None', 'Moderate', 'High', 'Severe', 'Critical'];

export default function DiseaseLibrary({ onSelectDisease }) {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const fetchDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiseases({
        crop: selectedCrop === 'All' ? null : selectedCrop,
        severity: selectedSeverity === 'All' ? null : selectedSeverity,
        search: search.trim() ? search.trim() : null,
      });
      setDiseases(data.diseases || []);
    } catch (err) {
      setError('Could not load disease database. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDiseases();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedCrop, selectedSeverity]);

  const getSeverityBadge = (sev) => {
    switch ((sev || '').toLowerCase()) {
      case 'critical':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getDiseaseImage = (disease) => {
    if (disease?.image_url && !disease.image_url.includes('1592878904946')) {
      return disease.image_url;
    }
    const id = (disease?.id || '').toLowerCase();
    const crop = (disease?.crop || '').toLowerCase();
    if (id.includes('early_blight') && (id.includes('tomato') || crop.includes('tomato'))) return '/images/diseases/tomato_early_blight.jpg';
    if (id.includes('late_blight') && (id.includes('tomato') || crop.includes('tomato'))) return '/images/diseases/tomato_late_blight.jpg';
    if (id.includes('leaf_mold')) return '/images/diseases/tomato_leaf_mold.jpg';
    if (id.includes('yellow_leaf_curl') || id.includes('curl_virus')) return '/images/diseases/tomato_yellow_leaf_curl.jpg';
    if (id.includes('early_blight') && (id.includes('potato') || crop.includes('potato'))) return '/images/diseases/potato_early_blight.jpg';
    if (id.includes('late_blight') && (id.includes('potato') || crop.includes('potato'))) return '/images/diseases/potato_late_blight.jpg';
    if (id.includes('potato')) return '/images/diseases/potato_healthy.jpg';
    if (id.includes('tomato')) return '/images/diseases/tomato_healthy.jpg';
    if (id.includes('corn') || crop.includes('corn')) return '/images/diseases/corn_common_rust.jpg';
    if (id.includes('apple') || crop.includes('apple')) return '/images/diseases/apple_scab.jpg';
    if (id.includes('grape') || crop.includes('grape')) return '/images/diseases/grape_black_rot.jpg';
    if (id.includes('pepper') || crop.includes('pepper')) return '/images/diseases/bell_pepper_bacterial_spot.jpg';
    return '/images/diseases/plant_leaf_default.jpg';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Disease Library
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Explore verified symptoms, causes, and treatments for common crop diseases.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by disease name, crop, or symptoms..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-600">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-600">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Disease Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading disease database...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-800 space-y-2">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="text-xs font-semibold">{error}</p>
          <button
            onClick={fetchDiseases}
            className="inline-flex items-center space-x-1.5 text-xs font-bold bg-red-100 text-red-900 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : diseases.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <Leaf className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No matching diseases found.</h4>
          <p className="text-xs text-slate-500">Try changing your search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {diseases.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectDisease(d.id)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
                  <img
                    src={getDiseaseImage(d)}
                    alt={d.disease_name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/diseases/plant_leaf_default.jpg';
                    }}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                    {d.crop}
                  </div>
                  <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(d.severity)}`}>
                    {d.severity}
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    {d.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{d.disease_name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {d.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>View Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
