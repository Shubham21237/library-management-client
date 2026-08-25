import API from './api';

export const loginApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getProfileApi = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export const getUsersApi = async () => {
  const response = await API.get('/auth/users');
  return response.data;
};
