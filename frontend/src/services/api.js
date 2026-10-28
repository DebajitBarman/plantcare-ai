/**
 * PlantCare AI - Frontend API Service
 * Centralized HTTP communication with FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function predictLeaf(formData) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.detail?.message || data.detail || 'Prediction request failed';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function getCrops() {
  const res = await fetch(`${API_BASE}/crops`);
  if (!res.ok) throw new Error('Failed to fetch supported crops');
  return res.json();
}

export async function getDiseases(params = {}) {
  const query = new URLSearchParams();
  if (params.crop) query.append('crop', params.crop);
  if (params.category) query.append('category', params.category);
  if (params.severity) query.append('severity', params.severity);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const res = await fetch(`${API_BASE}/diseases?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load diseases');
  return res.json();
}

export async function getDiseaseById(id) {
  const res = await fetch(`${API_BASE}/diseases/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Disease profile not found');
  return res.json();
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.crop) query.append('crop', params.crop);
  if (params.organic) query.append('organic', params.organic);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load agricultural products');
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function getHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.crop) query.append('crop', params.crop);
  if (params.disease) query.append('disease', params.disease);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);

  const res = await fetch(`${API_BASE}/history?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to load scan history');
  return res.json();
}

export async function getHistoryById(id) {
  const res = await fetch(`${API_BASE}/history/${id}`);
  if (!res.ok) throw new Error('Scan record not found');
  return res.json();
}

export async function deleteHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete scan record');
  return res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/history/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
  return res.json();
}

export async function getWeatherRisk(params = {}) {
  const query = new URLSearchParams();
  if (params.crop) query.append('crop', params.crop);
  if (params.temp) query.append('temp', params.temp);
  if (params.humidity) query.append('humidity', params.humidity);
  if (params.wetness_hours) query.append('wetness_hours', params.wetness_hours);

  const res = await fetch(`${API_BASE}/weather/risk?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to calculate environmental risk');
  return res.json();
}

export async function askAdvisory(question, crop = null, diseaseContext = null) {
  const res = await fetch(`${API_BASE}/advisory/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, crop, disease_context: diseaseContext }),
  });
  if (!res.ok) throw new Error('Failed to process advisory query');
  return res.json();
}
