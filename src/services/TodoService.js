import axios from "axios";
import { getToken } from "./AuthService";

const API_BASE = import.meta.env.VITE_BACK_END_URL; // 例：http://localhost:8080 或 https://your-api.com
const BASE_REST_API_URL = `${API_BASE}/api/todos`;

// export function getAllTodos(){
//     return axios.get(BASE_REST_API_URL);
// }

// axios.interceptors.request.use(function (config) {
    
//     config.headers['Authorization'] = getToken();
//     return config;
//   }, function (error) {
//     // Do something with request error
//     return Promise.reject(error);
//   });


  axios.interceptors.request.use(
  (config) => {
    const raw = getToken(); // 可能是 "xxx" 或 "Bearer xxx"
    if (raw) {
      const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const getAllTodos         = ()             => axios.get(BASE_REST_API_URL);
export const saveTodo            = (todo)         => axios.post(BASE_REST_API_URL, todo);
export const getTodo             = (id)           => axios.get(`${BASE_REST_API_URL}/${id}`);
export const updateTodo          = (id, todo)     => axios.put(`${BASE_REST_API_URL}/${id}`, todo);
export const deleteTodo          = (id)           => axios.delete(`${BASE_REST_API_URL}/${id}`);
export const completeTodo        = (id)           => axios.patch(`${BASE_REST_API_URL}/${id}/complete`);
export const inCompleteTodo      = (id)           => axios.patch(`${BASE_REST_API_URL}/${id}/in-complete`);
export const getPendingReviewTodos = ()           => axios.get(`${BASE_REST_API_URL}/pending-review`);
export const getReviewedTodos      = ()           => axios.get(`${BASE_REST_API_URL}/reviewed`);
export const reviewTodo            = (id)         => axios.put(`${BASE_REST_API_URL}/${id}/review`);
export const getTodoStatistics     = ()           => axios.get(`${BASE_REST_API_URL}/stats`);
export const getOverdueTodos       = ()           => axios.get(`${BASE_REST_API_URL}/overdue`);

  // export const getAllTodos = () => axios.get(BASE_REST_API_URL)

  // export const saveTodo = (todo) => axios.post(BASE_REST_API_URL, todo)
  
  // export const getTodo = (id) => axios.get(BASE_REST_API_URL + '/' + id)
  
  // export const updateTodo = (id, todo) => axios.put(BASE_REST_API_URL + '/' + id, todo)
  
  // export const deleteTodo = (id) => axios.delete(BASE_REST_API_URL + '/' + id)
  
  // export const completeTodo = (id) => axios.patch(BASE_REST_API_URL + '/' + id + '/complete')
  
  // export const inCompleteTodo = (id) => axios.patch(BASE_REST_API_URL + '/' + id + '/in-complete')

  // export const getPendingReviewTodos = () => axios.get(BASE_REST_API_URL + '/pending-review');

  // export const getReviewedTodos = () => axios.get(BASE_REST_API_URL + '/reviewed');

  // export const reviewTodo = (id) =>axios.put(BASE_REST_API_URL + '/' + id + '/review');

  // export const getTodoStatistics = () => axios.get(BASE_REST_API_URL + '/stats');

  // export const getOverdueTodos=()=>axios.get(BASE_REST_API_URL + '/overdue');
