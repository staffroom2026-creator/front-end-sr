import { api } from './api';

export const applicationService = {
  getApplyDetails: (jobId) => api.get(`/api/applications/apply/${jobId}`),
  applyToJob: (jobId, payload) => {
    if (payload instanceof FormData) {
      return api.post(`/api/applications/apply/${jobId}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post(`/api/applications/apply/${jobId}`, payload);
  },
  getMyApplications: (params = {}) => api.get('/api/applications/my-applications', { params }),
  getApplicationById: (applicationId) => api.get(`/api/applications/${applicationId}`),
  getApplicantsByJob: (jobId, params = {}) => api.get(`/api/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (applicationId, payload) =>
    api.patch(`/api/applications/${applicationId}/status`, payload),
  deleteApplication: (applicationId) => api.delete(`/api/applications/${applicationId}`),
  withdrawApplication: (applicationId) => api.patch(`/api/applications/${applicationId}/withdraw`),
  scheduleInterview: (applicationId, payload) =>
    api.post(`/api/applications/${applicationId}/interview`, payload),
  getInterview: (applicationId) =>
    api.get(`/api/applications/${applicationId}/interview`),
};
