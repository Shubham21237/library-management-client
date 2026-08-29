import API from './api';

export const getBooksApi = async (params = {}) => {
  const response = await API.get('/books', { params });
  return response.data;
};

export const getBookByIdApi = async (id) => {
  const response = await API.get(`/books/${id}`);
  return response.data;
};

export const createBookApi = async (formData) => {
  const response = await API.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateBookApi = async (id, formData) => {
  const response = await API.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteBookApi = async (id) => {
  const response = await API.delete(`/books/${id}`);
  return response.data;
};

export const fetchGoogleBooksMetadataApi = async (params) => {
  const response = await API.get('/books/fetch-external', { params });
  return response.data;
};

export const getCategoriesApi = async () => {
  const response = await API.get('/categories');
  return response.data;
};

export const createCategoryApi = async (categoryData) => {
  const response = await API.post('/categories', categoryData);
  return response.data;
};

export const addBookReviewApi = async (id, reviewData) => {
  const response = await API.post(`/books/${id}/reviews`, reviewData);
  return response.data;
};
