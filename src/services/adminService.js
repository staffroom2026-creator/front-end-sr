import { api } from './api';

export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getVerifications: () => api.get('/api/admin/verifications'),
  getTeachers: (params = {}) => api.get('/api/teachers', { params }),
  getTeacherById: (teacherId) => api.get(`/api/teachers/${teacherId}`),
  updateVerification: (schoolProfileId, payload) =>
    api.patch(`/api/admin/verifications/${schoolProfileId}`, payload),
};
