import { API_BASE } from './config.js';

const BASE = `${API_BASE}/gigs`;

export async function getGigs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function getGig(id) {
  const res = await fetch(`${BASE}/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createGig(gigData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gigData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function updateGigStatus(id, status) {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function updateGig(id, fields) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
