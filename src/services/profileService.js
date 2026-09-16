import { api } from './api';

export const profileService = {
  getMe: () => api.get('/api/profiles/me'),
  getProfileViews: (params = {}) => api.get('/api/profiles/teacher/profile-views', { params }),
  updateTeacher: (payload) => api.put('/api/profiles/teacher', payload),
  updateSchool: (payload) => api.put('/api/profiles/school', payload),
  createEducation: (payload) => api.post('/api/profiles/teacher/education', payload),
  getEducation: () => api.get('/api/profiles/teacher/education'),
  updateEducation: (educationId, payload) => api.put(`/api/profiles/teacher/education/${educationId}`, payload),
  patchEducation: (educationId, payload) => api.patch(`/api/profiles/teacher/education/${educationId}`, payload),
  deleteEducation: (educationId) => api.delete(`/api/profiles/teacher/education/${educationId}`),
  createExperience: (payload) => api.post('/api/profiles/teacher/experience', payload),
  getExperience: () => api.get('/api/profiles/teacher/experience'),
  updateExperience: (experienceId, payload) => api.put(`/api/profiles/teacher/experience/${experienceId}`, payload),
  patchExperience: (experienceId, payload) => api.patch(`/api/profiles/teacher/experience/${experienceId}`, payload),
  deleteExperience: (experienceId) => api.delete(`/api/profiles/teacher/experience/${experienceId}`),
  inviteTeacher: (teacherUserId, { message, job_id: jobId } = {}) => {
    const payload = { message };
    const encodedTeacherUserId = encodeURIComponent(teacherUserId);

    if (jobId) {
      payload.job_id = jobId;
    }

    return api.post(`/api/teachers/${encodedTeacherUserId}/invite`, payload).catch((error) => {
      const status = error?.response?.status;

      if (status !== 404 && status !== 405) {
        throw error;
      }

      return api.post(`/teachers/${encodedTeacherUserId}/invite`, payload);
    });
  },
  uploadCv: (formData) =>
    api.post('/api/profiles/upload-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  uploadLogo: (formData) =>
    api.post('/api/profiles/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};
