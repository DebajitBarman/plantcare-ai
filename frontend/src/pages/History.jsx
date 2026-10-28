import React, { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, History as HistoryIcon, RotateCcw } from 'lucide-react';
import { getHistory, deleteHistory, getHistoryById } from '../services/api';

export default function History({ onViewReport, onNewScan }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory({
        search: search.trim() || null,
      });
      setHistoryList(data.history || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete scan record #${id}?`)) return;

    try {
      await deleteHistory(id);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete history record.');
    }
  };

  const handleOpenReport = async (item) => {
    try {
      const fullData = await getHistoryById(item.id);
      const reconstructedReport = {
        report_id: item.id,
        created_at: item.created_at,
        image: {
          url: item.image_path,
          filename: item.image_filename,
        },
        meta: {
          location: item.location,
          growth_stage: item.growth_stage,
          notes: item.notes,
        },
        prediction: {
          crop: item.crop,
          disease: item.disease,
          class_id: item.class_id,
          severity: item.severity,
          confidence: item.confidence,
          confidence_percent: item.confidence_percent,
          confidence_level: item.confidence_level,
          is_demo_mode: item.is_demo_mode,
        },
        top_predictions: item.top_predictions || [],
        disease_info: fullData.disease_info || {},
        recommendations: fullData.recommendations || {},
      };
      onViewReport(reconstructedReport);
    } catch (err) {
      alert('Failed to load full report.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Scan History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review past leaf diagnoses and open full reports.
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Scan</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search past scans by crop or disease..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading scans...</p>
        </div>
      ) : historyList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
          <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No scan records found.</h4>
          <p className="text-xs text-slate-500">Uploaded leaf analyses will be saved here automatically.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Leaf</th>
                  <th className="py-3 px-3">Crop</th>
                  <th className="py-3 px-3">Diagnosis</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {historyList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleOpenReport(item)}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
                        <img
                          src={item.image_path}
                          alt="Leaf"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">{item.crop}</td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {item.disease}
                      {item.is_demo_mode && (
                        <span className="ml-1 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                          Demo
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {item.confidence_percent}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReport(item);
                          }}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
                          title="Open Report"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
