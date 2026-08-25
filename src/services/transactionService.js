import API from './api';

export const requestBookApi = async (bookId) => {
  const response = await API.post('/transactions/request', { bookId });
  return response.data;
};

export const getMyTransactionsApi = async () => {
  const response = await API.get('/transactions/my');
  return response.data;
};

export const getAllTransactionsApi = async (params = {}) => {
  const response = await API.get('/transactions', { params });
  return response.data;
};

export const approveIssueApi = async (id) => {
  const response = await API.put(`/transactions/${id}/approve`);
  return response.data;
};

export const rejectRequestApi = async (id) => {
  const response = await API.put(`/transactions/${id}/reject`);
  return response.data;
};

export const returnBookApi = async (id) => {
  const response = await API.put(`/transactions/${id}/return`);
  return response.data;
};

export const payFineApi = async (id) => {
  const response = await API.put(`/transactions/${id}/pay-fine`);
  return response.data;
};
