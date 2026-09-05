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
  getMyApplications: () => api.get('/api/applications/my-applications'),
  getApplicantsByJob: (jobId) => api.get(`/api/applications/job/${jobId}`),
  updateApplicationStatus: (applicationId, payload) =>
    api.patch(`/api/applications/${applicationId}/status`, payload),
  scheduleInterview: (applicationId, payload) =>
    api.post(`/api/applications/${applicationId}/interview`, payload),
  getInterview: (applicationId) =>
    api.get(`/api/applications/${applicationId}/interview`),
};
