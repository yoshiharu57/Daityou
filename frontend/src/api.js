import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 30000,
});

export const projectsApi = {
  list: (params = {}) => api.get('/api/projects/', { params }),
  get: (id) => api.get(`/api/projects/${id}`),
  create: (data) => api.post('/api/projects/', data),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
  stats: () => api.get('/api/projects/stats'),
};

export const logsApi = {
  list: (projectId) => api.get(`/api/activity-logs/project/${projectId}`),
  create: (data) => api.post('/api/activity-logs/', data),
  delete: (id) => api.delete(`/api/activity-logs/${id}`),
};
