import { api } from './api';

export const jobService = {
  getJobs: (params = {}) => api.get('/jobs', { params }),
  getJobById: (jobId) => api.get(`/jobs/${jobId}`),
  createJob: (payload) => api.post('/jobs', payload),
  updateJob: (jobId, payload) => api.put(`/jobs/${jobId}`, payload),
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),
};
