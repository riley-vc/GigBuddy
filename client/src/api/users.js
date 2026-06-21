const BASE = 'http://localhost:3000/api/users';

export async function getMusicians() {
  const res = await fetch(`${BASE}?role=musician`);
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
