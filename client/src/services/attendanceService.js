import api from './api';

export const attendanceService = {
  getAll: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  getSummary: async (params = {}) => {
    const response = await api.get('/attendance/summary', { params });
    return response.data;
  },

  mark: async (data) => {
    const response = await api.post('/attendance', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/attendance/${id}`, data);
    return response.data;
  },
};
