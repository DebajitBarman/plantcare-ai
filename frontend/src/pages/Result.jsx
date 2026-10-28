import React, { useState } from 'react';
import {
  Printer,
  RotateCcw,
  Eye,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Activity,
  CheckCircle2,
  Sprout,
  Droplets,
  HelpCircle,
  Package,
} from 'lucide-react';
import ConfidenceMeter from '../components/common/ConfidenceMeter';

export default function Result({ report, onNewScan }) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h3 className="text-lg font-bold text-slate-800">No active diagnostic report found.</h3>
        <button
          onClick={onNewScan}
          className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Scan a Leaf</span>
        </button>
      </div>
    );
  }

  const {
    prediction,
    top_predictions = [],
    disease_info = {},
    recommendations = {},
    image = {},
  } = report;

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Diagnosis Result
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Plant Health Report
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Report #{report.report_id} • {new Date(report.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onNewScan}
            className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      {prediction.is_demo_mode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Simulation / Demo Mode:</strong> Place a custom trained <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">disease_model.pt</code> in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">backend/models/</code> to enable live model weights.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
            Demo
          </span>
        </div>
      )}

      {/* Low Confidence Warning */}
      {prediction.confidence_level === 'Low' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Low Confidence Warning</h4>
            <p className="mt-0.5 text-red-700">
              Confidence is below standard reliability threshold. Please upload a clearer leaf image or consult a local agricultural extension officer.
            </p>
          </div>
        </div>
      )}

      {/* Main Diagnostic Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Leaf Image & Heatmap Toggle */}
        <div className="sm:col-span-5 space-y-2">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border border-slate-200">
            <img
              src={image.url}
              alt="Leaf Sample"
              className="w-full h-full object-cover"
            />
            {showHeatmap && image.heatmap_overlay && (
              <img
                src={image.heatmap_overlay}
                alt="Attention Heatmap"
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90 transition-opacity"
              />
            )}
            <div className="absolute top-2 left-2 bg-slate-900/80 text-white px-2 py-0.5 rounded-md text-[11px] font-mono">
              {prediction.crop}
            </div>
          </div>

          {image.heatmap_overlay && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-colors cursor-pointer ${
                showHeatmap
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{showHeatmap ? 'Hide Disease Heatmap' : 'Show Disease Heatmap'}</span>
            </button>
          )}
        </div>

        {/* Diagnosis Header Details */}
        <div className="sm:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              Crop: {prediction.crop}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getSeverityBadge(prediction.severity)}`}>
              Severity: {prediction.severity}
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
              {prediction.category}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {prediction.disease}
            </h2>
            {prediction.scientific_name && (
              <p className="text-xs italic text-slate-500 mt-0.5">
                Pathogen: {prediction.scientific_name}
              </p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <ConfidenceMeter
              confidence={prediction.confidence}
              level={prediction.confidence_level}
              showDetails={false}
            />
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {disease_info.description}
          </p>
        </div>
      </div>

      {/* Top 3 Alternative Candidates */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Why this prediction? (Top Candidate Probabilities)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {top_predictions.map((p, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border ${
                i === 0 ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate">{p.disease}</span>
                <span className="font-mono text-emerald-700">{p.confidence_percent}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${i === 0 ? 'bg-emerald-600' : 'bg-slate-400'}`}
                  style={{ width: p.confidence_percent }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symptoms & Causes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Symptoms</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {Array.isArray(disease_info.symptoms) ? (
              disease_info.symptoms.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <span>{s}</span>
                </li>
              ))
            ) : (
              <li>{disease_info.symptoms}</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Causes & Favorable Conditions</span>
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p>
              <strong className="text-slate-800">Cause:</strong> {disease_info.causes}
            </p>
            {disease_info.environmental_conditions && (
              <p className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                <strong>Conditions:</strong> {disease_info.environmental_conditions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Treatment Action Plan */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-slate-900">Treatment Action Plan</h3>
        <p className="text-xs sm:text-sm text-slate-700 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 leading-relaxed">
          {disease_info.treatment}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
            <h4 className="font-bold text-emerald-800 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Organic & Natural Alternatives</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {disease_info.organic_treatment || 'Apply copper soap, neem extract, or bio-fungicides.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Chemical Treatment</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {disease_info.chemical_treatment || 'Apply broad-spectrum protectant fungicides.'}
            </p>
          </div>
        </div>

        {disease_info.active_ingredients && (
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-800">
            <strong>Key Active Ingredients:</strong> {disease_info.active_ingredients}
          </div>
        )}
      </div>

      {/* Recommended Supplements & Products from Database */}
      {(recommendations.all_products?.length > 0 || disease_info.recommended_products?.length > 0) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Recommended Products & Supplements</span>
          </h3>
          <p className="text-xs text-slate-500">
            {recommendations.disclaimer || 'Commercial products based on recommended active ingredients.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(recommendations.all_products || disease_info.recommended_products || []).slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 uppercase">{prod.category}</span>
                  <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                    {prod.organic_or_chemical}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{prod.product_name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{prod.purpose}</p>
                <div className="text-[11px] text-slate-500 pt-1">
                  <strong>Active:</strong> {prod.active_ingredient}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prevention & Field Practices */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Prevention & Cultural Best Practices</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {disease_info.prevention}
        </p>

        {/* Dos and Donts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>DO</span>
            </h4>
            <ul className="space-y-1 text-emerald-950">
              {disease_info.do_and_dont?.dos?.map((d, idx) => (
                <li key={idx}>• {d}</li>
              )) || (
                <>
                  <li>• Water at the base in early morning</li>
                  <li>• Sanitize pruning tools between plants</li>
                  <li>• Space crops for good airflow</li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200 space-y-2 text-xs">
            <h4 className="font-bold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>DON'T</span>
            </h4>
            <ul className="space-y-1 text-red-950">
              {disease_info.do_and_dont?.donts?.map((d, idx) => (
                <li key={idx}>• {d}</li>
              )) || (
                <>
                  <li>• Do not water late in the evening</li>
                  <li>• Do not handle plants when foliage is wet</li>
                  <li>• Do not leave diseased debris in the field</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* When to consult an expert */}
        <div className="p-4 bg-slate-900 text-slate-300 rounded-2xl text-xs space-y-1">
          <strong className="text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>When to consult an agronomist</span>
          </strong>
          <p className="text-slate-400">
            If symptoms spread to more than 20% of the crop within 48 hours or fail to respond to treatment within 5 days, request an on-site inspection from your local agricultural extension service.
          </p>
        </div>
      </div>
    </div>
  );
}
