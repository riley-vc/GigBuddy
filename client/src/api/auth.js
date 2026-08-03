import { API_BASE } from './config.js';

const BASE = `${API_BASE}/auth`;

/**
 * Login with email + password.
 * Returns the user object on success, throws on failure.
 */
export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Login failed.');
  return json.data;
}

/**
 * Register a new account.
 * Returns the created user object on success, throws on failure.
 */
export async function register(name, email, password, role) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Registration failed.');
  return json.data;
}
