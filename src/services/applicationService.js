import { api } from './api';

export const applicationService = {
  applyToJob: (jobId, payload) => api.post(`/api/applications/apply/${jobId}`, payload),
  getMyApplications: () => api.get('/api/applications/my-applications'),
  getApplicantsByJob: (jobId) => api.get(`/api/applications/job/${jobId}`),
  updateApplicationStatus: (applicationId, payload) =>
    api.patch(`/api/applications/${applicationId}/status`, payload),
};
