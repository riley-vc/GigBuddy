import { API_BASE } from './config.js';

const BASE = `${API_BASE}/direct-conversations`;

export async function getDirectConversations(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function getDirectConversation(id) {
  const res = await fetch(`${BASE}/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

// Find-or-create a thread between two musicians
export async function openDirectConversation({ musicianId, otherMusicianId, musicianName, otherMusicianName }) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ musicianId, otherMusicianId, musicianName, otherMusicianName }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function markDirectConversationRead(id, musicianId) {
  const res = await fetch(`${BASE}/${id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ musicianId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
