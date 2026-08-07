import api, { auth } from './apiClient';

/**
 * Command palette backend (Feature 1).
 * Fuzzy matching happens client-side; this only fetches candidates the
 * browser can't already see, plus the persisted "Recent" list.
 */

const globalSearch = async (query, token, { limit = 8, signal } = {}) => {
    const { data } = await api.get('/search/global', {
        ...auth(token),
        params: { q: query, limit },
        signal,
    });
    return data;
};

const getRecents = async (token) => {
    const { data } = await api.get('/search/recent', auth(token));
    return data;
};

const addRecent = async (entry, token) => {
    const { data } = await api.post('/search/recent', entry, auth(token));
    return data;
};

const clearRecents = async (token) => {
    const { data } = await api.delete('/search/recent', auth(token));
    return data;
};

export default { globalSearch, getRecents, addRecent, clearRecents };
