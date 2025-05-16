// src/services/api.js
import axios from 'axios'

const API_URL = 'https://nextsteap.api-dev.bmax-edu.website'

// Функція для рекурсивного декодування рядків у юнікоді
const decodeUnicodeStrings = (obj) => {
  if (!obj) return obj

  if (typeof obj === 'string') {
    try {
      if (obj.includes('\\u')) {
        return JSON.parse(`"${obj}"`)
      }
    } catch (e) {
      console.warn('Помилка декодування рядка:', e)
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => decodeUnicodeStrings(item))
  }

  if (typeof obj === 'object') {
    const result = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = decodeUnicodeStrings(obj[key])
      }
    }
    return result
  }

  return obj
}

// Створюємо екземпляр axios з базовою URL
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false, // Змініть на true, якщо API потребує передачі cookies
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
  (response) => {
    // Декодуємо юнікод у відповіді
    if (response.data) {
      response.data = decodeUnicodeStrings(response.data)
    }
    return response
  },
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
const adminEmails = ['admin@example.com', 'super_admin@example.com', 'petropetrenko@gmail.com']

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

// API для категорій курсів
export const categoriesApi = {
  // Отримати всі категорії
  getAllCategories() {
    return api.get('/categories')
  },

  // Отримати категорію за ID
  getCategoryById(id) {
    return api.get(`/categories/${id}`)
  },

  // Отримати категорію за слагом
  getCategoryBySlug(slug) {
    return api.get(`/categories/slug/${slug}`)
  },

  // Отримати ієрархію категорій
  getCategoriesHierarchy() {
    return api.get('/categories_hierarchy')
  },

  // Отримати всі активні категорії
  getAllActiveCategories() {
    return api.get('/all_active_categories')
  },

  // Створити нову категорію
  createCategory(categoryData) {
    return api.post('/categories', categoryData)
  },

  // Змінити позицію категорії
  changePosition(id, position) {
    return api.post('/change_position_category', { id, position })
  },

  // Оновити категорію
  updateCategory(id, categoryData) {
    return api.put(`/update_category_by_id/${id}`, categoryData)
  },

  // Деактивувати категорію
  deactivateCategory(id) {
    return api.put(`/deactivate_category/${id}`)
  },

  // Активувати категорію
  activateCategory(id) {
    return api.put(`/activate_category/${id}`)
  },

  // Видалити категорію
  deleteCategory(id) {
    return api.delete(`/delete_category/${id}`)
  },
}

// API для курсів
export const coursesApi = {
  // Отримати всі курси з пагінацією
  getAllCourses(page = 1, perPage = 15) {
    return api.get('/courses', {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати курс за ID
  getCourseById(id) {
    return api.get(`/courses/${id}`)
  },

  // Отримати курси за категорією
  getCoursesByCategory(categoryId, page = 1, perPage = 15) {
    return api.get(`/course_by_category_id/${categoryId}`, {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати курси за рівнем
  getCoursesByLevel(levelId, page = 1, perPage = 15) {
    return api.get(`/course_by_level_id/${levelId}`, {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати курси за інструктором
  getCoursesByInstructor(instructorId, page = 1, perPage = 15) {
    return api.get(`/course_by_instructor_id/${instructorId}`, {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Опублікувати курс
  publishCourse(id) {
    return api.put(`/courses/${id}/publish`)
  },

  // Зняти курс з публікації
  unpublishCourse(id) {
    return api.put(`/courses/${id}/unpublish`)
  },

  // Оновити дані курсу
  updateCourse(id, courseData) {
    return api.put(`/courses/${id}`, courseData)
  },

  //Видалити курс
  deleteCourse(id) {
    return api.delete(`/courses/${id}`)
  },

  // Створити новий курс
  createCourse(courseData) {
    return api.post('/courses', courseData)
  },

  // Отримати типи уроків
  getLessonTypes() {
    return api.get('/type_lessons')
  },

  // Отримати тип уроку за ID
  getLessonTypeById(id) {
    return api.get(`/type_lesson_by_id/${id}`)
  },

  // Отримати всі провайдери відео
  getVideoProviders() {
    return api.get('/video_poviders')
  },

  // Завантажити обкладинку курсу
  uploadCourseCover(courseId, file) {
    const formData = new FormData()
    formData.append('cover_image', file) // змінено назву поля з 'cover' на 'cover_image'

    return api.post(`/courses/${courseId}/cover-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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

// API для модулів
export const modulesApi = {
  // Отримання всіх модулів курсу
  getModulesByCourse(courseId) {
    if (!courseId) {
      console.error('ID курсу не вказано в запиті getModulesByCourse')
      return Promise.reject(new Error('ID курсу не вказано'))
    }

    // Використовуємо основний ендпоінт отримання курсу, що має також повертати модулі
    return api
      .get(`/courses/${courseId}`)
      .then((response) => {
        // Якщо у відповіді є модулі, повертаємо їх
        if (response.data && response.data.modules) {
          return { data: response.data.modules }
        }
        throw new Error('Модулі не знайдено у відповіді')
      })
      .catch((error) => {
        // Якщо не знайдено модулі в першому ендпоінті, спробуємо інший
        console.warn(
          'Не вдалося отримати модулі з основного ендпоінту, використовуємо альтернативний',
          error.message,
        )
        return api.get(`/modules/${courseId}`)
      })
  },

  // Отримання модуля за ID
  getModuleById(moduleId) {
    return api.get(`/courses/modules/${moduleId}`)
  },

  // Створення нового модуля
  createModule(moduleData) {
    return api.post('/modules/manage', moduleData)
  },

  // Оновлення модуля
  updateModule(moduleId, moduleData) {
    return api.put(`/modules/manage/${moduleId}`, moduleData)
  },

  // Видалення модуля
  deleteModule(moduleId) {
    return api.delete(`/modules/manage/${moduleId}`)
  },

  // Зміна позиції модуля
  changeModulePosition(moduleId, position) {
    return api.put(`/modules/manage/${moduleId}/position`, { position })
  },

  // Масова зміна позицій модулів
  updateModulesPositions(positionsData) {
    return api.post('/modules/manage/positions', { positions: positionsData })
  },
}

// API для уроків
export const lessonsApi = {
  // Отримання всіх уроків модуля (для відображення)
  getLessonsByModule(moduleId) {
    return api.get(`/modules/${moduleId}/lessons`).catch((error) => {
      console.warn(
        `Не вдалося отримати уроки з ендпоінту /modules/${moduleId}/lessons:`,
        error.message,
      )
      // Спробуємо альтернативний ендпоінт
      return api.get(`/lessons/module/${moduleId}`)
    })
  },

  // Отримання всіх уроків для управління (НОВИЙ МЕТОД)
  getManageLessons(moduleId) {
    return api.get(`/lessons/manage/${moduleId}`)
  },

  // Отримання уроку за ID
  getLessonById(lessonId) {
    return api.get(`/lessons/${lessonId}`)
  },

  // Створення нового уроку
  createLesson(lessonData) {
    const formData = new FormData()

    // Додаємо основні дані уроку
    for (const key in lessonData) {
      if (key !== 'file' && key !== 'material_file') {
        formData.append(key, lessonData[key])
      }
    }

    // Додаємо файли, якщо вони є
    if (lessonData.file) {
      formData.append('file', lessonData.file)
    }

    if (lessonData.material_file) {
      formData.append('material_file', lessonData.material_file)
    }

    return api.post('/lessons/manage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Оновлення уроку
  updateLesson(lessonId, lessonData) {
    const formData = new FormData()

    // Додаємо основні дані уроку
    for (const key in lessonData) {
      if (key !== 'file' && key !== 'material_file') {
        formData.append(key, lessonData[key])
      }
    }

    // Додаємо файли, якщо вони є
    if (lessonData.file) {
      formData.append('file', lessonData.file)
    }

    if (lessonData.material_file) {
      formData.append('material_file', lessonData.material_file)
    }

    // Додаємо метод PUT для form-data
    formData.append('_method', 'PUT')

    return api.post(`/lessons/manage/${lessonId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Видалення уроку
  deleteLesson(lessonId) {
    return api.delete(`/lessons/manage/${lessonId}`)
  },

  // Зміна позиції уроку
  changeLessonPosition(lessonId, position) {
    return api.put(`/lessons/manage/${lessonId}/position`, { position })
  },

  // Масова зміна позицій уроків
  updateLessonsPositions(positionsData) {
    return api.post('/lessons/manage/positions', { positions: positionsData })
  },
}

// Оновимо експорт, щоб включити нові API
export default {
  auth: authAPI,
  students: studentsApi,
  requests: requestsApi,
  admins: adminsApi,
  categories: categoriesApi,
  courses: coursesApi,
  lessons: lessonsApi,
  modules: modulesApi,
  getImageUrl,
}
