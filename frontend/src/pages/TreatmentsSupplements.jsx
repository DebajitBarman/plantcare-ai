import React, { useState, useEffect } from 'react';
import { Search, Package, ShieldCheck } from 'lucide-react';
import { getProducts } from '../services/api';

const CATEGORIES = [
  'All Categories',
  'Fungicide',
  'Bio-fungicide',
  'Organic Insecticide & Fungicide',
  'Broad-Spectrum Systemic Fungicide',
  'Micronutrient / Supplement',
  'Fertilizer',
];

export default function TreatmentsSupplements() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        category: selectedCategory === 'All Categories' ? null : selectedCategory,
        search: search.trim() ? search.trim() : null,
      });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Treatments & Agricultural Products
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Browse verified fungicides, bio-pesticides, and crop health supplements.
        </p>
      </div>

      {/* Advisory Note */}
      <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-xs flex items-start space-x-3 border border-slate-800">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Product Guidelines:</strong> All products are matched from our backend agricultural database. Check local regulations and product labels before applying any treatment.
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, active ingredient, or crop..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No products found.</h4>
          <p className="text-xs text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const isOrganic = (p.organic_or_chemical || '').toLowerCase().includes('organic');
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 uppercase tracking-wide text-[11px]">
                      {p.category}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        isOrganic
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p.organic_or_chemical}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.product_name}</h3>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong>Target:</strong> {p.crop || 'All Crops'}
                    </p>
                    <p>
                      <strong>Active:</strong> {p.active_ingredient}
                    </p>
                    <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600 leading-relaxed">
                      {p.purpose}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  {p.usage_information && (
                    <p>
                      <strong className="text-slate-700">Usage:</strong> {p.usage_information}
                    </p>
                  )}
                  {p.precaution && (
                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      <strong>Caution:</strong> {p.precaution}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
