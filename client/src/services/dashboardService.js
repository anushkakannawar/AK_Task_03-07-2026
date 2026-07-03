import api from './api';

export const dashboardService = {
  getAdminSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getEmployeeSummary: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },
};
