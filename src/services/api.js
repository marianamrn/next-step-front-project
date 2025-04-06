// src/services/api.js
import axios from 'axios';

// Створюємо екземпляр axios з базовою URL
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Додаємо перехоплювач для додавання токена до запитів
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Експортуємо функції для роботи з API

// Аутентифікація
export const authAPI = {
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  register(userData) {
    return api.post('/auth/register', userData);
  },
  logout() {
    return api.post('/auth/logout');
  },
  getProfile() {
    return api.get('/auth/profile');
  }
};

// Управління студентами
export const studentsAPI = {
  getAll(params) {
    return api.get('/students', { params });
  },
  getById(id) {
    return api.get(`/students/${id}`);
  },
  create(data) {
    return api.post('/students', data);
  },
  update(id, data) {
    return api.put(`/students/${id}`, data);
  },
  delete(id) {
    return api.delete(`/students/${id}`);
  }
};

// Управління запитами до курсів
export const requestsAPI = {
  getAll(params) {
    return api.get('/requests', { params });
  },
  getById(id) {
    return api.get(`/requests/${id}`);
  },
  approve(id) {
    return api.post(`/requests/${id}/approve`);
  },
  reject(id) {
    return api.post(`/requests/${id}/reject`);
  }
};

// Управління викладачами
export const teachersAPI = {
  getAll(params) {
    return api.get('/teachers', { params });
  },
  getById(id) {
    return api.get(`/teachers/${id}`);
  },
  create(data) {
    return api.post('/teachers', data);
  },
  update(id, data) {
    return api.put(`/teachers/${id}`, data);
  },
  delete(id) {
    return api.delete(`/teachers/${id}`);
  }
};

// Управління курсами
export const coursesAPI = {
  getAll(params) {
    return api.get('/courses', { params });
  },
  getById(id) {
    return api.get(`/courses/${id}`);
  },
  create(data) {
    return api.post('/courses', data);
  },
  update(id, data) {
    return api.put(`/courses/${id}`, data);
  },
  delete(id) {
    return api.delete(`/courses/${id}`);
  }
};

// Управління коментарями та відгуками
export const commentsAPI = {
  getAll(params) {
    return api.get('/comments', { params });
  },
  getById(id) {
    return api.get(`/comments/${id}`);
  },
  approve(id) {
    return api.post(`/comments/${id}/approve`);
  },
  reject(id) {
    return api.post(`/comments/${id}/reject`);
  },
  delete(id) {
    return api.delete(`/comments/${id}`);
  }
};

// Отримання статистики
export const statisticsAPI = {
  getOverview() {
    return api.get('/statistics/overview');
  },
  getStudentStats() {
    return api.get('/statistics/students');
  },
  getCourseStats() {
    return api.get('/statistics/courses');
  },
  getFinancialStats() {
    return api.get('/statistics/financial');
  }
};

export default {
  auth: authAPI,
  students: studentsAPI,
  requests: requestsAPI,
  teachers: teachersAPI,
  courses: coursesAPI,
  comments: commentsAPI,
  statistics: statisticsAPI
};