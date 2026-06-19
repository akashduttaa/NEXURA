import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Add request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const state = JSON.parse(localStorage.getItem('nexura-auth-storage') || '{}');
  if (state?.state?.token) {
    config.headers.Authorization = `Bearer ${state.state.token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  demoSetup: () => api.post('/auth/demo-setup'),
};

export const timetableAPI = {
  generate: (data = {}) => api.post('/timetable/generate', data),
  simulateChange: (unavailableFaculty) => api.post('/timetable/simulate-change', { unavailableFaculty }),
  getCurrent: () => api.get('/timetable/current'),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  getByRoll: (rollNo) => api.get(`/students/${rollNo}`),
};

export const facultyAPI = {
  getAll: () => api.get('/faculty'),
};

export const courseAPI = {
  getAll: () => api.get('/courses'),
};

export const roomAPI = {
  getAll: () => api.get('/rooms'),
};

export const transactionAPI = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  validate: () => api.get('/transactions/validate'),
  tamper: (blockIndex, data) => api.post('/transactions/tamper', { blockIndex, data }),
  repair: () => api.post('/transactions/repair'),
  verifyStudent: (rollNo) => api.get(`/transactions/verify-student/${rollNo}`),
};

export const analyticsAPI = {
  getAll: () => api.get('/analytics'),
};

export const seedAPI = {
  reset: () => api.post('/seed'),
};

export default api;
