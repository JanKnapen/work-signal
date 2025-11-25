import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('=== API Configuration ===');
console.log('REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);
console.log('Final API_URL:', API_URL);
console.log('All REACT_APP env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) =>
    axios.post(`${API_URL}/api/token/`, { username, password }),
  
  refresh: (refresh) =>
    axios.post(`${API_URL}/api/token/refresh/`, { refresh }),
};

export const signalAPI = {
  getConversations: () => api.get('/api/conversations/'),
  getGroups: () => api.get('/api/groups/'),
  getMessages: (params) => api.get('/api/messages/', { params }),
  getMessage: (id) => api.get(`/api/messages/${id}/`),
  sendMessage: (to, message) => api.post('/api/send/', { to, message }),
  getStats: () => api.get('/api/stats/'),
  getProfile: () => api.get('/api/profile/'),
  getContactProfile: (contact) => api.get('/api/contact/profile/', { params: { contact } }),
};

export default api;
