import { api } from './api';

export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getVerifications: () => api.get('/api/admin/verifications'),
  updateVerification: (schoolProfileId, payload) =>
    api.patch(`/api/admin/verifications/${schoolProfileId}`, payload),
};
