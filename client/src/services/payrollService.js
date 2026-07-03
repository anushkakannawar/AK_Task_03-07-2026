import api from './api';

export const payrollService = {
  getAll: async (params = {}) => {
    const response = await api.get('/payroll', { params });
    return response.data;
  },

  getByEmployee: async (employeeId, params = {}) => {
    const response = await api.get(`/payroll/${employeeId}`, { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/payroll', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/payroll/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/payroll/${id}`);
    return response.data;
  },
};
