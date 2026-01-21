import { api } from './axios';

export const authService = {
  register: async (email, password) => {
    const response = await api.post('/api/auth/register', { email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
