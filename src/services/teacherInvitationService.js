import { api } from './api';

export const teacherInvitationService = {
  get: (invitationId) => api.get(`/api/teacher-invitations/${encodeURIComponent(invitationId)}`),
  respond: (invitationId, payload) =>
    api.post(`/api/teacher-invitations/${encodeURIComponent(invitationId)}/response`, payload),
};
