import api, { auth } from './apiClient';

/**
 * Notification Center API (Feature 2).
 * All calls return plain data; error handling lives in the calling hook so
 * the UI can decide between a toast, an inline error, or a silent retry.
 */

const list = async (token, { page = 1, limit = 20, filter = 'all', search = '' } = {}) => {
    const { data } = await api.get('/notifications', {
        ...auth(token),
        params: { page, limit, filter, search: search || undefined },
    });
    return data;
};

const count = async (token) => {
    const { data } = await api.get('/notifications/count', auth(token));
    return data.unreadCount;
};

const create = async (payload, token) => {
    const { data } = await api.post('/notifications', payload, auth(token));
    return data;
};

/** Omit `ids` to mark everything read. */
const markRead = async (token, ids) => {
    const { data } = await api.patch('/notifications/read', { ids }, auth(token));
    return data;
};

const remove = async (id, token) => {
    const { data } = await api.delete(`/notifications/${id}`, auth(token));
    return data;
};

const clearAll = async (token) => {
    const { data } = await api.delete('/notifications', auth(token));
    return data;
};

export default { list, count, create, markRead, remove, clearAll };
