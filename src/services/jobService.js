import { api } from './api';

export const jobService = {
  getJobs: (params = {}) => api.get('/api/jobs', { params }),
  getJobById: (jobId) => api.get(`/api/jobs/${jobId}`),
  createJob: (payload) => api.post('/api/jobs', payload),
  updateJob: (jobId, payload) => api.put(`/api/jobs/${jobId}`, payload),
  publishJob: (jobId) => api.post(`/api/jobs/${jobId}/publish`),
  deleteJob: (jobId) => api.delete(`/api/jobs/${jobId}`),
};
