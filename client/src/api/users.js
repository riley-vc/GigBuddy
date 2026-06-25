const BASE = '/api/users';

export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function getUser(id) {
  const res = await fetch(`${BASE}/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
