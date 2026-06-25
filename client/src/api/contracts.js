const BASE = '/api/contracts';

export async function getContracts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function createContract(contractData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contractData),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function signContract(id, role, signature) {
  const res = await fetch(`${BASE}/${id}/sign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, signature }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
