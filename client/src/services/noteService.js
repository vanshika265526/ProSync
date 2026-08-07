import axios from 'axios';
import { API_BASE } from './apiClient';

const API_URL = `${API_BASE}/notes`;

const getNotes = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const createNote = async (noteData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, noteData, config);
    return response.data;
};

const updateNote = async (id, noteData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/${id}`, noteData, config);
    return response.data;
};

const deleteNote = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
};

const noteService = {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
};

export default noteService;
