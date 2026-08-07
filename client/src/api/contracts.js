import { API_BASE } from './config.js';

const BASE = `${API_BASE}/contracts`;

export async function getContracts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function getContract(id) {
  const res = await fetch(`${BASE}/${id}`);
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

export async function updateEscrowTerms(id, { escrowSplitRatio, secondInstallmentDueDays }) {
  const res = await fetch(`${BASE}/${id}/escrow-terms`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ escrowSplitRatio, secondInstallmentDueDays }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function fundContract(id) {
  const res = await fetch(`${BASE}/${id}/fund`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function confirmAttendance(id, role) {
  const res = await fetch(`${BASE}/${id}/confirm-attendance`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function reportNoShow(id, reportedBy) {
  const res = await fetch(`${BASE}/${id}/no-show`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportedBy }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function reportConcern(id, role, note) {
  const res = await fetch(`${BASE}/${id}/report-concern`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, note }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function cancelContract(id, role) {
  const res = await fetch(`${BASE}/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function paySecondInstallment(id) {
  const res = await fetch(`${BASE}/${id}/pay-second-installment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function configurePayoutSplits(id, { method, splits, payoutMode }) {
  const res = await fetch(`${BASE}/${id}/payout-splits`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, splits, payoutMode }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function respondToPayoutSplit(id, musicianId, status) {
  const res = await fetch(`${BASE}/${id}/payout-splits/${musicianId}/respond`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}
