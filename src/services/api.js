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

// Замініть існуючий categoriesApi в src/services/api.js на цей код:

// API для категорій курсів
export const categoriesApi = {
  // ПУБЛІЧНІ МЕТОДИ (без автентифікації)

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
    return api.get('/categories/hierarchy')
  },

  // Отримати всі активні категорії
  getActiveCategories() {
    return api.get('/categories/active')
  },

  // АДМІНІСТРАТОРСЬКІ МЕТОДИ (потрібна автентифікація та права адміністратора)

  // Створити нову категорію - ВИПРАВЛЕНО відповідно до маршрутів
  createCategory(categoryData) {
    console.log('Створення категорії з даними:', categoryData)
    return api.post('/categories/manage', categoryData)
  },

  // Оновити категорію - ВИПРАВЛЕНО відповідно до маршрутів
  updateCategory(id, categoryData) {
    console.log(`Оновлення категорії ${id} з даними:`, categoryData)
    return api.put(`/categories/manage/${id}`, categoryData)
  },

  // Видалити категорію - ВИПРАВЛЕНО відповідно до маршрутів
  deleteCategory(id) {
    console.log(`Видалення категорії ${id}`)
    return api.delete(`/categories/manage/${id}`)
  },

  // Змінити позицію категорій
  updateCategoriesPositions(positions) {
    return api.post('/categories/manage/positions', { positions })
  },

  // Перемикання активності категорії
  toggleCategoryActive(id) {
    return api.put(`/categories/manage/${id}/toggle-active`)
  },

  // Активувати категорію
  activateCategory(id) {
    return api.put(`/categories/manage/${id}/activate`)
  },

  // Деактивувати категорію
  deactivateCategory(id) {
    return api.put(`/categories/manage/${id}/deactivate`)
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
        //published: true, // Тільки опубліковані курси
      },
    })
  },

  // Отримати курс за ID
  getCourseById(id) {
    return api.get(`/courses/${id}`)
  },

  // Пошук курсів
  searchCourses(query, page = 1, perPage = 15) {
    return api.get('/courses/search', {
      params: {
        query,
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати курси за категорією (оновлена функція)
  getCoursesByCategory(categoryId, page = 1, perPage = 15) {
    return api.get(`/courses/category/${categoryId}`, {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати курси за рівнем
  getCoursesByLevel(levelId, page = 1, perPage = 15) {
    return api.get(`/courses/level/${levelId}`, {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати курси за інструктором
  getCoursesByInstructor(instructorId, page = 1, perPage = 15) {
    return api.get(`/courses/instructor/${instructorId}`, {
      params: {
        page,
        per_page: perPage,
      },
    })
  },

  // Отримати всі рівні
  getAllLevels() {
    return api.get('/levels')
  },

  // Отримати всіх інструкторів
  getAllInstructors() {
    return api.get('/instructors')
  },

  // Отримати курси з фільтрами
  getCoursesWithFilters(filters = {}, page = 1, perPage = 15) {
    const params = {
      page,
      per_page: perPage,
      ...filters,
    }

    // Видаляємо порожні параметри
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    return api.get('/courses', { params })
  },

  // Отримати популярні курси
  getPopularCourses(page = 1, perPage = 15) {
    return api.get('/courses', {
      params: {
        page,
        per_page: perPage,
        sort: 'popular',
      },
    })
  },

  // Отримати новітні курси
  getLatestCourses(page = 1, perPage = 15) {
    return api.get('/courses', {
      params: {
        page,
        per_page: perPage,
        sort: 'latest',
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
  // Отримання всіх уроків модуля
  getLessonsByModule(moduleId) {
    console.log(`Отримання уроків для модуля ${moduleId}`)
    return api.get(`/modules/${moduleId}/lessons`)
  },

  // Отримання уроку за ID
  getLessonById(lessonId) {
    console.log(`Отримання уроку ${lessonId}`)
    return api.get(`/lessons/${lessonId}`)
  },

  // Створення нового уроку
  createLesson(lessonData) {
    console.log('API: Створення уроку з даними:', lessonData)

    // Перевіряємо наявність файлів для формування correct Content-Type
    const hasFiles = lessonData.file || lessonData.material_file

    if (hasFiles) {
      // Якщо є файли, потрібно використовувати FormData
      const formData = new FormData()

      // Додаємо всі поля, крім файлів
      for (const key in lessonData) {
        if (key === 'file' || key === 'material_file') continue

        if (lessonData[key] !== null && lessonData[key] !== undefined) {
          formData.append(key, lessonData[key])
        }
      }

      // Додаємо файли
      if (lessonData.file) {
        formData.append('file', lessonData.file)
      }

      if (lessonData.material_file) {
        formData.append('material_file', lessonData.material_file)
      }

      // Логуємо поля FormData для діагностики
      console.log('FormData fields:')
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File (${value.name}, ${value.type}, ${value.size} bytes)`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      // Відправляємо запит з FormData
      return api.post('/lessons/manage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      // Якщо немає файлів, можна відправляти як звичайний JSON
      return api.post('/lessons/manage', lessonData)
    }
  },

  // Оновлення уроку
  updateLesson(lessonId, lessonData) {
    console.log(`API: Оновлення уроку з ID ${lessonId} з даними:`, lessonData)

    // Перевіряємо наявність файлів
    const hasFiles = lessonData.file || lessonData.material_file

    if (hasFiles) {
      // Якщо є файли, потрібно використовувати FormData з _method: PUT
      const formData = new FormData()

      // Додаємо метод PUT
      formData.append('_method', 'PUT')

      // Додаємо всі поля, крім файлів і полів, які не можна оновлювати
      for (const key in lessonData) {
        if (key === 'file' || key === 'material_file' || key === 'type' || key === 'module_id')
          continue

        if (lessonData[key] !== null && lessonData[key] !== undefined) {
          formData.append(key, lessonData[key])
        }
      }

      // Додаємо файли
      if (lessonData.file) {
        formData.append('file', lessonData.file)
      }

      if (lessonData.material_file) {
        formData.append('material_file', lessonData.material_file)
      }

      // Логуємо поля FormData для діагностики
      console.log('FormData fields for update:')
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File (${value.name}, ${value.type}, ${value.size} bytes)`)
        } else {
          console.log(`${key}: ${value}`)
        }
      }

      // Відправляємо запит з FormData через POST з _method: PUT
      return api.post(`/lessons/manage/${lessonId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      // Якщо немає файлів, можна використовувати PUT запит
      return api.put(`/lessons/manage/${lessonId}`, lessonData)
    }
  },

  // Видалення уроку
  deleteLesson(lessonId) {
    console.log(`Видалення уроку ${lessonId}`)
    return api.delete(`/lessons/manage/${lessonId}`)
  },

  // Додайте цей метод до api.js
  createLessonRaw(lessonData, files = {}) {
    console.log('Створення нового уроку з даними:', lessonData)

    // Отримуємо базову URL з конфігурації
    const apiUrl = `${API_URL}/api/lessons/manage`

    // Створюємо FormData вручну
    const formData = new FormData()

    // Додаємо всі поля
    for (const key in lessonData) {
      if (lessonData[key] !== undefined && lessonData[key] !== null) {
        formData.append(key, lessonData[key])
      }
    }

    // Додаємо файли
    for (const key in files) {
      if (files[key]) {
        formData.append(key, files[key])
      }
    }

    // Отримуємо токен з localStorage
    const token = localStorage.getItem('token')

    // Відправляємо запит через fetch API
    return fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    }).then((response) => {
      // Спочатку отримуємо JSON
      return response.json().then((data) => {
        // Якщо статус не OK, кидаємо помилку з даними
        if (!response.ok) {
          const error = new Error(data.message || 'Помилка запиту')
          error.response = {
            status: response.status,
            data: data,
          }
          throw error
        }
        // Якщо все добре, повертаємо дані
        return { data }
      })
    })
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
