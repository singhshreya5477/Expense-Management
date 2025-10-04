import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  assignManager: (id, managerId) => api.put(`/users/${id}/manager`, { managerId }),
  delete: (id) => api.delete(`/users/${id}`),
};

// Company API
export const companyAPI = {
  getMy: () => api.get('/companies/my-company'),
  update: (data) => api.put('/companies/my-company', data),
  getCurrencies: () => api.get('/companies/currencies'),
};

// Expense API
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getMyExpenses: (params) => api.get('/expenses/my-expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Approval API
export const approvalAPI = {
  getPending: (params) => api.get('/approvals/pending', { params }),
  approve: (requestId, data) => api.post(`/approvals/${requestId}/approve`, data),
  reject: (requestId, data) => api.post(`/approvals/${requestId}/reject`, data),
};

// Approval Rule API
export const approvalRuleAPI = {
  getAll: (params) => api.get('/approval-rules', { params }),
  getById: (id) => api.get(`/approval-rules/${id}`),
  create: (data) => api.post('/approval-rules', data),
  update: (id, data) => api.put(`/approval-rules/${id}`, data),
  delete: (id) => api.delete(`/approval-rules/${id}`),
};

// OCR API
export const ocrAPI = {
  scanReceipt: (formData) => api.post('/ocr/scan-receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
