import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ser_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('ser_token');
        localStorage.removeItem('ser_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  logout: () => api.post('/api/auth/logout'),
  getCurrentUser: () => api.get('/api/auth/me'),
  changePassword: (data) => api.put('/api/auth/change-password', data),
};

export const dashboardApi = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getAnalytics: () => api.get('/api/dashboard/analytics'),
};

export const aiApi = {
  getStatus: () => api.get('/api/ai/status'),
  analyzeImage: (formData) => api.post('/api/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyzeVideo: (formData) => api.post('/api/ai/analyze-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDetections: (params) => api.get('/api/ai/detections', { params }),
  getDetection: (id) => api.get(`/api/ai/detections/${id}`),
};

export const accidentsApi = {
  getAccidents: (params) => api.get('/api/accidents', { params }),
  getAccident: (id) => api.get(`/api/accidents/${id}`),
  createAccident: (data) => api.post('/api/accidents', data),
  updateAccident: (id, data) => api.put(`/api/accidents/${id}`, data),
  deleteAccident: (id) => api.delete(`/api/accidents/${id}`),
  verifyAccident: (id, data) => api.put(`/api/accidents/${id}/verify`, data),
  updateStatus: (id, data) => api.put(`/api/accidents/${id}/status`, data),
};

export const unitsApi = {
  getUnits: (params) => api.get('/api/emergency-units', { params }),
  getUnit: (id) => api.get(`/api/emergency-units/${id}`),
  createUnit: (data) => api.post('/api/emergency-units', data),
  updateUnit: (id, data) => api.put(`/api/emergency-units/${id}`, data),
  deleteUnit: (id) => api.delete(`/api/emergency-units/${id}`),
};

export const assignmentsApi = {
  getAssignments: (params) => api.get('/api/assignments', { params }),
  createAssignment: (data) => api.post('/api/assignments', data),
  updateStatus: (id, data) => api.put(`/api/assignments/${id}/status`, data),
};

export const notificationsApi = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all'),
};

export const reportsApi = {
  getAccidentsReport: (params) => api.get('/api/reports/accidents', { params }),
  getSeverityReport: (params) => api.get('/api/reports/severity', { params }),
  getResponseTimeReport: (params) => api.get('/api/reports/response-time', { params }),
  getExportCsvUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/reports/export-csv?${query}`;
  }
};

export const usersApi = {
  getUsers: () => api.get('/api/users'),
  updateUserRole: (id, data) => api.put(`/api/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getAuditLogs: (params) => api.get('/api/users/audit-logs', { params }),
};

export const healthApi = {
  checkHealth: () => api.get('/api/health'),
};

export default api;
