// src/services/api.js
import axios from 'axios';

// Створюємо екземпляр axios з базовою URL
const api = axios.create({
  baseURL: 'http://26.154.95.249/api',
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

// Додаємо перехоплювач для обробки відповідей
api.interceptors.response.use(
  response => response,
  error => {
    // Якщо помилка 401 (неавторизований), перенаправляємо на сторінку логіну
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Список адміністраторських email
const adminEmails = ['admin@example.com', 'super_admin@example.com'];

// Аутентифікація
export const authAPI = {
  // Вхід
  login(credentials) {
    return api.post('/login', credentials);
  },

  // Авторизація з логікою збереження токена і перенаправлення
  async authenticate(credentials, router) {
    try {
      const response = await this.login(credentials);
      console.log('Повна відповідь API:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          localStorage.setItem('user', JSON.stringify({ email: credentials.email }));
        }

        const emailLower = credentials.email.toLowerCase();

        if (adminEmails.includes(emailLower) || emailLower.includes('admin')) {
          console.log('Це адміністратор, перенаправляємо на адмін-панель');
          if (router) router.push('/admin');
          return { success: true, isAdmin: true };
        } else {
          console.log('Це звичайний користувач, перенаправляємо на домашню сторінку');
          if (router) router.push('/home');
          return { success: true, isAdmin: false };
        }
      } else {
        throw new Error('Не вдалося увійти: відсутній токен у відповіді');
      }
    } catch (error) {
      console.error('Помилка логіну:', error);

      let errorMessage = 'Помилка при вході. Спробуйте ще раз.';

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Невірний email або пароль';
        } else if (error.response.status === 500) {
          errorMessage = 'Помилка на сервері. Спробуйте пізніше.';
        } else {
          errorMessage = `Помилка: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Немає відповіді від сервера. Перевірте підключення до мережі.';
      }

      return { success: false, errorMessage };
    }
  },

  // Реєстрація
  register(userData) {
    return api.post('/register', userData);
  },

  // Вихід
  logout() {
    return api.post('/logout');
  },

  // Отримати профіль користувача
  getProfile() {
    return api.get('/me');
  }
};

// API для студентів
export const studentsAPI = {
  getAll(params) {
    return api.get('/users', { params });
  },
  getById(id) {
    return api.get(`/users/${id}`);
  },
  create(data) {
    return api.post('/users', data);
  },
  update(id, data) {
    return api.put(`/users/${id}`, data);
  },
  delete(id) {
    return api.delete(`/users/${id}`);
  }
};

// API для адміністраторів
export const adminsAPI = {
  getAll(params) {
    return api.get('/users/admins/list', { params });
  },
  create(data) {
    return api.post('/users/admins', data);
  }
};

// Експорт всього API
export default {
  auth: authAPI,
  students: studentsAPI,
  admins: adminsAPI
};
