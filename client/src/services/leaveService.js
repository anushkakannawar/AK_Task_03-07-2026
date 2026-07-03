import api from './api';

export const leaveService = {
  getAll: async (params = {}) => {
    const response = await api.get('/leaves', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data;
  },

  apply: async (data) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  updateStatus: async (id, status, review_note = '') => {
    const response = await api.patch(`/leaves/${id}/status`, { status, review_note });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};
