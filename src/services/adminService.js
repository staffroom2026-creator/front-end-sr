import { api } from './api';

export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getVerifications: () => api.get('/api/admin/verifications'),
  getTeachers: () => api.get('/api/teachers'),
  getTeacherById: (teacherId) => api.get(`/api/teachers/${teacherId}`),
  getUsers: () => api.get('/api/users'),
  updateVerification: (schoolProfileId, payload) =>
    api.patch(`/api/admin/verifications/${schoolProfileId}`, payload),
};
