import API from './api';

export const summarizeBookApi = async (bookData) => {
  const response = await API.post('/ai/summarize', bookData);
  return response.data;
};

export const recommendBooksApi = async () => {
  const response = await API.post('/ai/recommend');
  return response.data;
};
