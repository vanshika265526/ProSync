import axios from 'axios';
import { API_BASE } from './apiClient';

const API_URL = `${API_BASE}/tasks`;

// Get user tasks
const getTasks = async (projectId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            projectId,
        },
    };

    const response = await axios.get(API_URL, config)
    ;
    return response.data;
};

// Create new task
const createTask = async (taskData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(API_URL, taskData, config);
    return response.data;
};

// Update task
const updateTask = async (taskId, taskData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(`${API_URL}/${taskId}`, taskData, config);
    return response.data;
};

// Delete task
const deleteTask = async (taskId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.delete(`${API_URL}/${taskId}`, config);
    return response.data;
};

const taskService = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
};

export default taskService;
