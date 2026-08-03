/**
 * API Configuration
 *
 * In development: Vite's proxy handles /api → localhost:4000 automatically.
 * In production:  VITE_API_URL points to the Render backend.
 *
 * All API wrappers import API_BASE from here instead of hardcoding '/api'.
 */

// For REST API calls
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// For Socket.io connection
export const SOCKET_URL = import.meta.env.VITE_API_URL || '';
