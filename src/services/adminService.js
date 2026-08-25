import { api } from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getVerifications: () => api.get('/admin/verifications'),
  updateVerification: (schoolProfileId, payload) =>
    api.patch(`/admin/verifications/${schoolProfileId}`, payload),
};
