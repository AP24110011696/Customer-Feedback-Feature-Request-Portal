import api from './api';

export const featureService = {
  list: (params = {}) => api.get('/features', { params }).then((r) => r.data),
  getById: (id) => api.get(`/features/${id}`).then((r) => r.data),
  create: (payload) => api.post('/features', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/features/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/features/${id}`).then((r) => r.data),
  predict: (payload) => api.post('/features/predict', payload).then((r) => r.data),
  vote: (id) => api.post(`/votes/${id}`).then((r) => r.data),
};

export const feedbackService = {
  list: (params = {}) => api.get('/feedback', { params }).then((r) => r.data),
  getById: (id) => api.get(`/feedback/${id}`).then((r) => r.data),
  create: (payload) => api.post('/feedback', payload).then((r) => r.data),
  remove: (id) => api.delete(`/feedback/${id}`).then((r) => r.data),
};

export const commentService = {
  list: (requestId) => api.get(`/comments/${requestId}`).then((r) => r.data),
  create: (requestId, content) =>
    api.post(`/comments/${requestId}`, { content }).then((r) => r.data),
  remove: (id) => api.delete(`/comments/comment/${id}`).then((r) => r.data),
};

export const adminService = {
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
  users: () => api.get('/admin/users').then((r) => r.data),
  updateRole: (id, role) =>
    api.put(`/admin/users/${id}/role`, { role }).then((r) => r.data),
};
