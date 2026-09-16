import { api } from './api';

const internalAdminBase = '/api/internal-admin';

const resourcePath = (resource, id = '') => `${internalAdminBase}/${resource}${id ? `/${encodeURIComponent(id)}` : ''}`;

export const internalAdminService = {
  getOverview: () => api.get(`${internalAdminBase}/overview`),

  getJobs: (params = {}) => api.get(resourcePath('jobs'), { params }),
  getJob: (jobId) => api.get(resourcePath('jobs', jobId)),
  updateJobStatus: (jobId, payload) => api.patch(`${resourcePath('jobs', jobId)}/status`, payload),

  getSchools: (params = {}) => api.get(resourcePath('schools'), { params }),
  getSchool: (schoolId) => api.get(resourcePath('schools', schoolId)),
  updateSchoolStatus: (schoolId, payload) => api.patch(`${resourcePath('schools', schoolId)}/status`, payload),

  getTeachers: (params = {}) => api.get(resourcePath('teachers'), { params }),
  getTeacher: (userId) => api.get(resourcePath('teachers', userId)),
  getTeacherApplications: (userId, params = {}) => api.get(`${resourcePath('teachers', userId)}/applications`, { params }),
  updateTeacherStatus: (userId, payload) => api.patch(`${resourcePath('teachers', userId)}/status`, payload),

  getAdmins: (params = {}) => api.get(resourcePath('admins'), { params }),
  getInvitations: (params = {}) => api.get(`${resourcePath('admins')}/invitations`, { params }),
  createInvitation: (payload) => api.post(`${resourcePath('admins')}/invitations`, payload),
  resendInvitation: (invitationId) => api.post(`${resourcePath('admins')}/invitations/${encodeURIComponent(invitationId)}/resend`),
  revokeInvitation: (invitationId) => api.post(`${resourcePath('admins')}/invitations/${encodeURIComponent(invitationId)}/revoke`),
  updateAdminStatus: (adminId, payload) => api.patch(`${resourcePath('admins', adminId)}/status`, payload),
  updateAdminRole: (adminId, payload) => api.patch(`${resourcePath('admins', adminId)}/role`, payload),

  getReports: (params = {}) => api.get(resourcePath('reports'), { params }),
  getReport: (reportId) => api.get(resourcePath('reports', reportId)),
  updateReport: (reportId, payload) => api.patch(resourcePath('reports', reportId), payload),

  getNotifications: (params = {}) => api.get(resourcePath('notifications'), { params }),
  markNotificationRead: (notificationId) => api.patch(`${resourcePath('notifications', notificationId)}/read`),
  markAllNotificationsRead: () => api.patch(`${resourcePath('notifications')}/read-all`),

  getSettings: () => api.get(resourcePath('settings')),
  updateSettings: (payload) => api.patch(resourcePath('settings'), payload),

  getAuditLog: (params = {}) => api.get(`${resourcePath('audit-log')}`, { params }),
};