import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

axios.defaults.baseURL = API_URL;

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const bookAPI = {
  getAll: (params) => axios.get('/books', { params }),
  getById: (id) => axios.get(`/books/${id}`),
  create: (data) => axios.post('/books', data),
  update: (id, data) => axios.put(`/books/${id}`, data),
  delete: (id) => axios.delete(`/books/${id}`)
};

export const reviewAPI = {
  getByBook: (bookId) => axios.get(`/reviews/book/${bookId}`),
  getByUser: (userId) => axios.get(`/reviews/user/${userId}`),
  create: (data) => axios.post('/reviews', data),
  update: (id, data) => axios.put(`/reviews/${id}`, data),
  delete: (id) => axios.delete(`/reviews/${id}`)
};

export default axios;