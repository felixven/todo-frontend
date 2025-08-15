import axios from "axios";
import { getToken } from "./AuthService";

const API_BASE = import.meta.env.VITE_BACK_END_URL; // 例：http://localhost:8080 或 https://your-api.com
const BASE_REST_API_URL = `${API_BASE}/api/todos`;


export const getMessages = (todoId) => axios.get(`${BASE_REST_API_URL}/${todoId}/messages`);
export const addMessage = (todoId, content) =>
    axios.post(`${BASE_REST_API_URL}/${todoId}/messages`, { content });
export const deleteMessage = (todoId, messageId) =>
    axios.delete(`${BASE_REST_API_URL}/${todoId}/messages/${messageId}`);