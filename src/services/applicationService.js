import { api } from './api';

export const applicationService = {
  applyToJob: (jobId, payload) => api.post(`/applications/apply/${jobId}`, payload),
  getMyApplications: () => api.get('/applications/my-applications'),
  getApplicantsByJob: (jobId) => api.get(`/applications/job/${jobId}`),
  updateApplicationStatus: (applicationId, payload) =>
    api.patch(`/applications/${applicationId}/status`, payload),
};
