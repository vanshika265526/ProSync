import axios from 'axios';

/**
 * Single source of truth for where the API lives.
 *
 * In development `VITE_API_URL` is usually unset and this falls back to the
 * local server. In production it MUST be set at build time — Vite inlines
 * `import.meta.env` values into the bundle, so changing it later means
 * rebuilding, not just restarting.
 *
 * Any trailing slash is stripped so `${API_ORIGIN}/api/...` can never produce
 * a double slash, which some hosts 301-redirect and thereby drop the
 * Authorization header.
 */
const rawOrigin = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ORIGIN = rawOrigin.replace(/\/+$/, '');

/** Base for every REST route, e.g. `${API_BASE}/tasks`. */
export const API_BASE = `${API_ORIGIN}/api`;

const api = axios.create({ baseURL: API_BASE });

/** Bearer header helper — every endpoint here is authenticated. */
export const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export default api;
