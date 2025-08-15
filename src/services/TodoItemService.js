import axios from "axios";
import { getToken } from "./AuthService";

const API_BASE = import.meta.env.VITE_BACK_END_URL; 
const BASE_REST_API_URL = `${API_BASE}/api/todos`;

export const listItems      = (todoId) => axios.get(`${BASE_REST_API_URL}/${todoId}/items`);
export const addItem        = (todoId, title) => axios.post(`${BASE_REST_API_URL}/${todoId}/items`, { title });
export const deleteItem     = (todoId, itemId) => axios.delete(`${BASE_REST_API_URL}/${todoId}/items/${itemId}`);
export const completeItem   = (todoId, itemId) => axios.patch(`${BASE_REST_API_URL}/${todoId}/items/${itemId}/complete`);
export const uncompleteItem = (todoId, itemId) => axios.patch(`${BASE_REST_API_URL}/${todoId}/items/${itemId}/incomplete`);
export const getSummary     = (todoId) => axios.get(`${BASE_REST_API_URL}/${todoId}/items/summary`);