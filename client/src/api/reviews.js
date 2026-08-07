import { API_BASE } from './config.js';

const BASE = `${API_BASE}/reviews`;

export async function getReviews(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createReview(reviewData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
