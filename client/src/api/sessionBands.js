import { API_BASE } from './config.js';

const BASE = `${API_BASE}/session-bands`;

export async function getSessionBands(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function getSessionBand(id) {
  const res = await fetch(`${BASE}/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createSessionBand(bandData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bandData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function inviteToSessionBand(id, { musicianId, instrument }) {
  const res = await fetch(`${BASE}/${id}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ musicianId, instrument }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function respondToSessionBandInvite(id, musicianId, status) {
  const res = await fetch(`${BASE}/${id}/members/${musicianId}/respond`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function removeSessionBandMember(id, musicianId) {
  const res = await fetch(`${BASE}/${id}/members/${musicianId}`, { method: 'DELETE' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
