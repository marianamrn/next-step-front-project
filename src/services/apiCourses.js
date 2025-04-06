// src/services/apiCourses.js
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

// Категорії курсів
export const categoriesAPI = {
  getAll() {
    return api.get('/categories');
  },
  create(data) {
    return api.post('/categories', data);
  },
  update(id, data) {
    return api.put(`/categories/${id}`, data);
  },
  delete(id) {
    return api.delete(`/categories/${id}`);
  }
};

// Курси
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
  },
  publish(id) {
    return api.post(`/courses/${id}/publish`);
  },
  uploadCover(courseId, formData) {
    return api.post(`/courses/${courseId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteCover(courseId) {
    return api.delete(`/courses/${courseId}/cover`);
  }
};

// Уроки
export const lessonsAPI = {
  getAll(courseId) {
    return api.get(`/courses/${courseId}/lessons`);
  },
  getById(courseId, lessonId) {
    return api.get(`/courses/${courseId}/lessons/${lessonId}`);
  },
  create(courseId, data) {
    return api.post(`/courses/${courseId}/lessons`, data);
  },
  update(courseId, lessonId, data) {
    return api.put(`/courses/${courseId}/lessons/${lessonId}`, data);
  },
  delete(courseId, lessonId) {
    return api.delete(`/courses/${courseId}/lessons/${lessonId}`);
  },
  publish(courseId, lessonId) {
    return api.post(`/courses/${courseId}/lessons/${lessonId}/publish`);
  }
};

export default {
  categories: categoriesAPI,
  courses: coursesAPI,
  lessons: lessonsAPI
};