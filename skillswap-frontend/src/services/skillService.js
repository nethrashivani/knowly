import axios from 'axios';
import { getToken } from './authService';

const BASE_URL = 'http://localhost:8080/api/skills';

const authHeaders = () => ({
    headers: { Authorization: `Bearer ${getToken()}` }
});

export const getAllSkills = async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
};

export const getSkillById = async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
};

export const createSkill = async (skillData) => {
    const response = await axios.post(BASE_URL, skillData, authHeaders());
    return response.data;
};

export const updateSkill = async (id, skillData) => {
    const response = await axios.put(`${BASE_URL}/${id}`, skillData, authHeaders());
    return response.data;
};

export const deleteSkill = async (id) => {
    await axios.delete(`${BASE_URL}/${id}`, authHeaders());
};

export const searchSkills = async (keyword) => {
    const response = await axios.get(`${BASE_URL}/search?keyword=${keyword}`);
    return response.data;
};

export const getSkillsByCategory = async (category) => {
    const response = await axios.get(`${BASE_URL}/category/${category}`);
    return response.data;
};

export const getMySkills = async () => {
    const response = await axios.get(`${BASE_URL}/my`, authHeaders());
    return response.data;
};

export const getOtherSkills = async () => {
    const response = await axios.get(`${BASE_URL}/other`);
    return response.data;
};