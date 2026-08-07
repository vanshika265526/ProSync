import axios from 'axios';

/**
 * Shared axios instance for the productivity features.
 *
 * The older services each hard-code their own base URL; rather than rewrite
 * them, this exports the same origin from one place so new code has a single
 * knob (and an env override) to turn.
 */
export const API_ORIGIN =
    import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({ baseURL: `${API_ORIGIN}/api` });

/** Bearer header helper — every endpoint here is authenticated. */
export const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export default api;
