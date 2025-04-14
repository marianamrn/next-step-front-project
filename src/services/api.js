// src/api/api.js
import axios from 'axios'

const API_URL = 'http://26.154.95.249'

// Створюємо екземпляр axios з базовою URL
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Додаємо перехоплювач для додавання токена до запитів
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Додаємо перехоплювач для обробки відповідей
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Якщо помилка 401 (неавторизований), перенаправляємо на сторінку логіну
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Список адміністраторських email
const adminEmails = ['admin@example.com', 'super_admin@example.com']

// Аутентифікація
export const authAPI = {
  // Вхід
  login(credentials) {
    return api.post('/login', credentials)
  },

  // Авторизація з логікою збереження токена і перенаправлення
  async authenticate(credentials, router) {
    try {
      const response = await this.login(credentials)
      console.log('Повна відповідь API:', response.data)

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } else {
          localStorage.setItem('user', JSON.stringify({ email: credentials.email }))
        }

        const emailLower = credentials.email.toLowerCase()

        if (adminEmails.includes(emailLower) || emailLower.includes('admin')) {
          console.log('Це адміністратор, перенаправляємо на адмін-панель')
          if (router) router.push('/admin')
          return { success: true, isAdmin: true }
        } else {
          console.log('Це звичайний користувач, перенаправляємо на домашню сторінку')
          if (router) router.push('/home')
          return { success: true, isAdmin: false }
        }
      } else {
        throw new Error('Не вдалося увійти: відсутній токен у відповіді')
      }
    } catch (error) {
      console.error('Помилка логіну:', error)

      let errorMessage = 'Помилка при вході. Спробуйте ще раз.'

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.status === 401) {
          errorMessage = 'Невірний email або пароль'
        } else if (error.response.status === 500) {
          errorMessage = 'Помилка на сервері. Спробуйте пізніше.'
        } else {
          errorMessage = `Помилка: ${error.response.status}`
        }
      } else if (error.request) {
        errorMessage = 'Немає відповіді від сервера. Перевірте підключення до мережі.'
      }

      return { success: false, errorMessage }
    }
  },

  // Реєстрація
  register(userData) {
    return api.post('/register', userData)
  },

  // Реєстрація студента
  registerStudent(userData) {
    return api.post('/register', userData)
  },

  // Вихід
  logout() {
    return api.post('/logout')
  },

  // Отримати профіль користувача
  getProfile() {
    return api.get('/me')
  },
}

// API для студентів
export const studentsApi = {
  // Отримання списку студентів з пагінацією
  getStudents(page = 1, perPage = 10) {
    return api.get(`/users`, { params: { page, per_page: perPage } })
  },

  // Пошук студента за id
  getStudentById(id) {
    return api.get(`/users/${id}`)
  },

  // Пошук студентів за номером/іменем/прізвищем/email
  searchStudents(query, page = 1, perPage = 10) {
    return api.get(`/users/search`, {
      params: {
        query,
        page,
        per_page: perPage,
      },
    })
  },

  // Оновлення даних студента
  updateStudent(id, studentData) {
    return api.put(`/users/${id}`, studentData)
  },

  // Деактивація студента
  deactivateStudent(id) {
    return api.post(`/users/${id}/deactivate`)
  },
}

// API для запитів студентів
export const requestsApi = {
  // Отримання списку запитів
  getRequests(filter = 'all', page = 1, perPage = 10) {
    return api.get(`/requests`, {
      params: {
        filter,
        page,
        per_page: perPage,
      },
    })
  },

  // Пошук запитів
  searchRequests(query, page = 1, perPage = 10) {
    return api.get(`/requests/search`, {
      params: {
        query,
        page,
        per_page: perPage,
      },
    })
  },

  // Схвалення запиту
  approveRequest(id) {
    return api.post(`/requests/${id}/approve`)
  },

  // Відхилення запиту
  rejectRequest(id) {
    return api.post(`/requests/${id}/reject`)
  },
}

// API для адміністраторів
export const adminsApi = {
  getAll(params) {
    return api.get('/users/admins/list', { params })
  },
  create(data) {
    return api.post('/users/admins', data)
  },
}

// Функція для обробки завантаження зображень
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/150'

  if (imagePath.startsWith('http')) {
    return imagePath
  } else {
    return `${API_URL}/storage/${imagePath}`
  }
}

// Експорт всього API
export default {
  auth: authAPI,
  students: studentsApi,
  requests: requestsApi,
  admins: adminsApi,
  getImageUrl,
}
