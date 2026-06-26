const BASE_CONV = '/api/conversations';
const BASE_MSG  = '/api/messages';

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res   = await fetch(`${BASE_CONV}${query ? `?${query}` : ''}`);
  const json  = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createConversation(data) {
  const res  = await fetch(BASE_CONV, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function markConversationRead(id, role) {
  const res  = await fetch(`${BASE_CONV}/${id}/read`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(conversationId) {
  const res  = await fetch(`${BASE_MSG}?conversationId=${conversationId}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
