import axios from 'axios';

const API_URL = 'http://localhost:5001/api/github';

const cfg = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

/** Turns an axios error into a plain, human-readable message. */
export const githubErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong talking to GitHub.';

// --- Repository connection ---

const validateRepository = async (repository, token) => {
    const { data } = await axios.post(`${API_URL}/validate`, { repository }, cfg(token));
    return data;
};

const connectRepository = async (projectId, repository, token) => {
    const { data } = await axios.post(`${API_URL}/${projectId}/connect`, { repository }, cfg(token));
    return data;
};

const disconnectRepository = async (projectId, token) => {
    const { data } = await axios.delete(`${API_URL}/${projectId}/disconnect`, cfg(token));
    return data;
};

// --- Reads ---

const getProjectGithub = async (projectId, token, { refresh = false } = {}) => {
    const { data } = await axios.get(
        `${API_URL}/${projectId}${refresh ? '?refresh=1' : ''}`,
        cfg(token)
    );
    return data;
};

const getActivity = async (projectId, token) => {
    const { data } = await axios.get(`${API_URL}/${projectId}/activity`, cfg(token));
    return data;
};

const getCommits = async (projectId, token, { branch, limit = 20 } = {}) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (branch) params.set('branch', branch);
    const { data } = await axios.get(`${API_URL}/${projectId}/commits?${params}`, cfg(token));
    return data;
};

const listPullRequests = async (projectId, token) => {
    const { data } = await axios.get(`${API_URL}/${projectId}/pulls`, cfg(token));
    return data;
};

const listIssues = async (projectId, token) => {
    const { data } = await axios.get(`${API_URL}/${projectId}/issues`, cfg(token));
    return data;
};

const syncProject = async (projectId, token) => {
    const { data } = await axios.post(`${API_URL}/${projectId}/sync`, {}, cfg(token));
    return data;
};

// --- Task links ---

const attachPullRequest = async (projectId, taskId, pullRequest, token) => {
    const { data } = await axios.post(
        `${API_URL}/${projectId}/tasks/${taskId}/pull-request`, { pullRequest }, cfg(token)
    );
    return data;
};

const detachPullRequest = async (projectId, taskId, token) => {
    const { data } = await axios.delete(
        `${API_URL}/${projectId}/tasks/${taskId}/pull-request`, cfg(token)
    );
    return data;
};

const attachIssue = async (projectId, taskId, issue, token) => {
    const { data } = await axios.post(
        `${API_URL}/${projectId}/tasks/${taskId}/issue`, { issue }, cfg(token)
    );
    return data;
};

const detachIssue = async (projectId, taskId, token) => {
    const { data } = await axios.delete(`${API_URL}/${projectId}/tasks/${taskId}/issue`, cfg(token));
    return data;
};

const syncTask = async (projectId, taskId, token) => {
    const { data } = await axios.post(
        `${API_URL}/${projectId}/tasks/${taskId}/sync`, {}, cfg(token)
    );
    return data;
};

// --- Notifications ---

const getNotifications = async (token, { limit = 50 } = {}) => {
    const { data } = await axios.get(`${API_URL}/notifications?limit=${limit}`, cfg(token));
    return data;
};

const markNotificationsRead = async (token, ids) => {
    const { data } = await axios.put(`${API_URL}/notifications/read`, { ids }, cfg(token));
    return data;
};

const deleteNotification = async (token, id) => {
    const { data } = await axios.delete(`${API_URL}/notifications/${id}`, cfg(token));
    return data;
};

const clearNotifications = async (token) => {
    const { data } = await axios.delete(`${API_URL}/notifications`, cfg(token));
    return data;
};

const githubService = {
    validateRepository,
    connectRepository,
    disconnectRepository,
    getProjectGithub,
    getActivity,
    getCommits,
    listPullRequests,
    listIssues,
    syncProject,
    attachPullRequest,
    detachPullRequest,
    attachIssue,
    detachIssue,
    syncTask,
    getNotifications,
    markNotificationsRead,
    deleteNotification,
    clearNotifications,
};

export default githubService;
