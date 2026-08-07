import axios from 'axios';
import { API_BASE } from './apiClient';

const API_URL = `${API_BASE}/projects`;

// Get user projects
const getProjects = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Create new project
const createProject = async (projectData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(API_URL, projectData, config);
    return response.data;
};

// Update project
const updateProject = async (projectId, projectData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.put(`${API_URL}/${projectId}`, projectData, config);
    return response.data;
};

// Delete project
const deleteProject = async (projectId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.delete(`${API_URL}/${projectId}`, config);
    return response.data;
};

// Join project
const joinProject = async (projectId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const response = await axios.post(`${API_URL}/join`, { projectId }, config);
    return response.data;
};

const projectService = {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    joinProject,
};

export default projectService;
