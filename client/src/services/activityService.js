import api, { auth } from './apiClient';

/**
 * Project History Timeline (Feature 3) and Live Activity Feed (Feature 4).
 * Both are paginated the same way, so they share a shape: { items, hasMore }.
 */

const getActivity = async (projectId, token, { page = 1, limit = 25, filter = 'all', search = '' } = {}) => {
    const { data } = await api.get(`/projects/${projectId}/activity`, {
        ...auth(token),
        params: { page, limit, filter, search: search || undefined },
    });
    return data;
};

const getHistory = async (projectId, token, { page = 1, limit = 25, filter = 'all', search = '', since } = {}) => {
    const { data } = await api.get(`/projects/${projectId}/history`, {
        ...auth(token),
        params: { page, limit, filter, search: search || undefined, since },
    });
    return data;
};

const getHistoryStats = async (projectId, token) => {
    const { data } = await api.get(`/projects/${projectId}/history/stats`, auth(token));
    return data;
};

export default { getActivity, getHistory, getHistoryStats };
