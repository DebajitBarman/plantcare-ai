import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getDashboardStats } from '../services/api';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Dashboard({ onViewReport, onNewScan }) {
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Aggregating agronomic diagnostic statistics...</p>
      </div>
    );
  }

  const {
    total_scans = 0,
    diseases_detected = 0,
    healthy_plants = 0,
    most_detected_crop = 'None',
    crop_distribution = [],
    disease_distribution = [],
    severity_distribution = [],
    recent_scans = [],
  } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('dashboard.totalScans')}
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{total_scans}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('dashboard.diseasesDetected')}
            </span>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">{diseases_detected}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('dashboard.healthyPlants')}
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{healthy_plants}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t('dashboard.topCrop')}
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1 truncate max-w-[140px]">
              {most_detected_crop}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crop Distribution Bar Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>{t('dashboard.cropBreakdown')}</span>
          </h3>
          {crop_distribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crop_distribution}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No scan distribution data available yet.
            </div>
          )}
        </div>

        {/* Disease Prevalency Donut Chart */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>{t('dashboard.diseaseDistribution')}</span>
          </h3>
          {disease_distribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={disease_distribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {disease_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No disease distribution data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <span>{t('dashboard.recentActivity')}</span>
        </h3>

        {recent_scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Crop</th>
                  <th className="py-2.5">Diagnosis</th>
                  <th className="py-2.5">Confidence</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_scans.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 font-bold text-slate-900">{r.crop}</td>
                    <td className="py-3 font-medium text-slate-800">{r.disease}</td>
                    <td className="py-3 font-mono font-bold text-emerald-700">
                      {r.confidence_percent}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onViewReport(r)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No recent scans logged.</p>
        )}
      </div>
    </div>
  );
}
