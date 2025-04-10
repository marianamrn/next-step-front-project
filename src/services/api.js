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
  // Базова функція для відправки запиту на логін
  login(credentials) {
    return api.post('/login', credentials);
  },
  
  // Розширена функція авторизації з логікою перенаправлення
  async authenticate(credentials, router) {
    try {
      // Використовуємо базову функцію логіну
      const response = await this.login(credentials);
      
      console.log('Повна відповідь API:', response.data);
      
      // Перевіряємо наявність токена
      if (response.data && response.data.token) {
        // Зберігаємо токен
        localStorage.setItem('token', response.data.token);
        
        // Зберігаємо інформацію про користувача
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // Якщо дані користувача відсутні, створюємо базову структуру
          localStorage.setItem('user', JSON.stringify({ email: credentials.email }));
        }
        
        // Перевіряємо чи email належить адміністратору
        const emailLower = credentials.email.toLowerCase();
        
        if (adminEmails.includes(emailLower) || emailLower.includes('admin')) {
          console.log('Це адміністратор, перенаправляємо на адмін-панель');
          if (router) {
            router.push('/admin');
          }
          return { success: true, isAdmin: true };
        } else {
          console.log('Це звичайний користувач, перенаправляємо на домашню сторінку');
          if (router) {
            router.push('/home');
          }
          return { success: true, isAdmin: false };
        }
      } else {
        throw new Error('Не вдалося увійти: відсутній токен у відповіді');
      }
    } catch (error) {
      console.error('Помилка логіну:', error);
      
      let errorMessage = 'Помилка при вході. Спробуйте ще раз.';
      
      if (error.response) {
        // Сервер відповів з помилкою
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
        // Запит був відправлений, але відповідь не отримана
        errorMessage = 'Немає відповіді від сервера. Перевірте підключення до мережі.';
      }
      
      return { success: false, errorMessage };
    }
  },
  
  register(userData) {
    return api.post('/register', userData);
  },
  
  logout() {
    return api.post('/logout');
  },
  
  getProfile() {
    return api.get('/me');
  }
};

// Управління студентами
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

// Управління адміністраторами
export const adminsAPI = {
  getAll(params) {
    return api.get('/users/admins/list', { params });
  },
  create(data) {
    return api.post('/users/admins', data);
  }
};

export default {
  auth: authAPI,
  students: studentsAPI,
  admins: adminsAPI
};