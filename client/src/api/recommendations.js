import { API_BASE } from './config.js';

const BASE = `${API_BASE}/recommendations`;

export async function getRecommendations(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
