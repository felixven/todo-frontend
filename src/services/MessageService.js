import axios from "axios";
import { getToken } from "./AuthService";

const API_BASE = import.meta.env.VITE_BACK_END_URL; 
const BASE_REST_API_URL = `${API_BASE}/api/todos`;

  axios.interceptors.request.use(
  (config) => {
    const raw = getToken(); 
    if (raw) {
      const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getMessages = (todoId) => axios.get(`${BASE_REST_API_URL}/${todoId}/messages`);
export const addMessage = (todoId, content) =>
    axios.post(`${BASE_REST_API_URL}/${todoId}/messages`, { content });
export const deleteMessage = (todoId, messageId) =>
    axios.delete(`${BASE_REST_API_URL}/${todoId}/messages/${messageId}`);