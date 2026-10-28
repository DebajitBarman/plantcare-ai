import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Stethoscope,
  Sprout,
  Droplets,
  Package,
} from 'lucide-react';
import { getDiseaseById } from '../services/api';

export default function DiseaseDetail({ diseaseId, onBack }) {
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getDiseaseById(diseaseId);
        setDisease(data);
      } catch (err) {
        setError('Failed to load disease profile.');
      } finally {
        setLoading(false);
      }
    }
    if (diseaseId) {
      load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [diseaseId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading disease profile...</p>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">{error || 'Disease not found.'}</h3>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>
      </div>
    );
  }

  const getDiseaseImage = (d) => {
    if (d?.image_url && !d.image_url.includes('1592878904946')) {
      return d.image_url;
    }
    const id = (d?.id || '').toLowerCase();
    const crop = (d?.crop || '').toLowerCase();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Disease Library</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        <div className="sm:col-span-5 aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
          <img
            src={getDiseaseImage(disease)}
            alt={disease.disease_name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/diseases/plant_leaf_default.jpg';
            }}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="sm:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {disease.crop}
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
              {disease.category}
            </span>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              Severity: {disease.severity}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            {disease.disease_name}
          </h1>

          {disease.scientific_name && (
            <p className="text-xs italic text-slate-500">
              Pathogen: {disease.scientific_name}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            {disease.description}
          </p>
        </div>
      </div>

      {/* Symptoms and Causes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Symptoms</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {Array.isArray(disease.symptoms) ? (
              disease.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li>{disease.symptoms}</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Causes & Environment</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              <strong className="text-slate-800">Primary Cause:</strong> {disease.causes}
            </p>
            {disease.transmission && (
              <p>
                <strong className="text-slate-800">Transmission:</strong> {disease.transmission}
              </p>
            )}
            {disease.environmental_conditions && (
              <p className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900">
                <strong>Conditions:</strong> {disease.environmental_conditions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
          <span>Treatment & Prevention</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 leading-relaxed">
          {disease.treatment}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <strong className="text-emerald-800 flex items-center gap-1">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Organic Alternatives</span>
            </strong>
            <p className="text-slate-600">
              {disease.organic_treatment || 'Copper soap or Bacillus subtilis biofungicide.'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 flex items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Chemical Controls</span>
            </strong>
            <p className="text-slate-600">
              {disease.chemical_treatment || 'Apply contact or systemic fungicides according to label.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
