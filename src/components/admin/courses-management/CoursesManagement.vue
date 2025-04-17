<!-- src\components\admin\courses-management\CoursesManagement.vue -->
<template>
  <div class="courses-management">
    <!-- Навігаційне меню для управління курсами -->
    <div v-if="!selectedCourse" class="course-nav">
      <div class="filter-panel">
        <span class="filter-label">Категорія:</span>
        <div class="dropdown">
          <button class="dropdown-toggle">
            {{ selectedCategory ? selectedCategory.name : 'Всі категорії' }}
            <v-icon>mdi-chevron-down</v-icon>
          </button>
          <div class="dropdown-menu">
            <div class="dropdown-item" @click="setCategory(null)">Всі категорії</div>
            <div
              class="dropdown-item"
              v-for="category in categories"
              :key="category.id"
              @click="setCategory(category)"
            >
              {{ category.name }}
            </div>
            <div class="dropdown-item add-category" @click="showCategoryModal = true">
              <v-icon small>mdi-plus</v-icon>
              Додати категорію
            </div>
          </div>
        </div>
      </div>
      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Пошук курсів"
          class="search-input"
          @input="handleSearch"
        />
        <v-icon class="search-icon">mdi-magnify</v-icon>
      </div>
      <button class="add-button" @click="openCourseModal()">
        <v-icon small>mdi-plus</v-icon>
        Додати курс
      </button>
    </div>

    <!-- Грід для відображення курсів (відображається тільки якщо не вибрано курс) -->
    <div v-if="!selectedCourse" class="courses-container">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Завантаження курсів...</p>
      </div>
      <div v-else-if="filteredCourses.length === 0" class="no-courses">
        <p>Курсів не знайдено</p>
      </div>
      <div v-else class="courses-grid">
        <course-card
          v-for="course in filteredCourses"
          :key="course.id"
          :course="course"
          @click="selectCourse(course)"
          @edit="openCourseModal(course)"
          @publish="publishCourse(course)"
          @unpublish="unpublishCourse(course)"
          @delete="confirmDeleteCourse(course)"
        />
      </div>
    </div>

    <!-- Детальна інформація про вибраний курс -->
    <course-detail
      v-if="selectedCourse"
      :course="selectedCourse"
      @back="backToCoursesList"
      @edit-course="openCourseModal"
      @publish-course="publishCourse"
      @unpublish-course="unpublishCourse"
      @delete-course="confirmDeleteCourse"
      @add-lesson="openLessonModal()"
      @edit-lesson="openLessonModal"
      @publish-lesson="publishLesson"
      @delete-lesson="confirmDeleteLesson"
    />

    <!-- Модальні вікна -->
    <category-modal
      v-if="showCategoryModal"
      :category="currentCategory"
      @close="closeCategoryModal"
      @save="saveCategory"
    />

    <course-modal
      v-if="showCourseModal"
      :course="currentCourse"
      :categories="categories"
      @close="closeCourseModal"
      @save="saveCourse"
    />

    <lesson-modal
      v-if="showLessonModal"
      :lesson="currentLesson"
      :course-id="selectedCourse ? selectedCourse.id : null"
      @close="closeLessonModal"
      @save="saveLesson"
    />

    <confirm-modal
      v-if="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="confirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script>
import api from '@/services/api.js'
import CourseCard from './CourseCard.vue'
import CourseDetail from './CourseDetail.vue'
import CategoryModal from './CategoryModal.vue'
import CourseModal from './CourseModal.vue'
import LessonModal from './LessonModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'CoursesManagement',
  components: {
    CourseCard,
    CourseDetail,
    CategoryModal,
    CourseModal,
    LessonModal,
    ConfirmModal,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    return { router, route }
  },
  data() {
    return {
      courses: [],
      categories: [],
      searchQuery: '',
      selectedCategory: null,
      selectedCourse: null,
      showCategoryModal: false,
      showCourseModal: false,
      showLessonModal: false,
      showConfirmModal: false,
      loading: false,
      error: null,

      // Тимчасові об'єкти для модальних вікон
      currentCategory: null,
      currentCourse: null,
      currentLesson: null,

      // Для модального вікна підтвердження
      confirmTitle: '',
      confirmMessage: '',
      confirmAction: () => {},
    }
  },
  computed: {
    filteredCourses() {
      if (!this.courses) return []

      let filtered = this.courses

      // Фільтр за категорією
      if (this.selectedCategory) {
        filtered = filtered.filter((course) => course.category_id === this.selectedCategory.id)
      }

      // Фільтр за пошуковим запитом
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(query) ||
            (course.description && course.description.toLowerCase().includes(query)) ||
            (course.category && course.category.name.toLowerCase().includes(query)),
        )
      }

      return filtered
    },
  },
  created() {
    this.fetchCategories()
    this.fetchCourses()

    // Check if route has course ID
    if (this.route.params.id) {
      this.loadCourseById(this.route.params.id)
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await api.categories.getAllCategories()
        this.categories = response.data.data
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error)
        this.error = 'Не вдалося завантажити категорії'
      }
    },

    async fetchCourses() {
      this.loading = true
      try {
        if (this.selectedCategory) {
          const response = await api.courses.getCoursesByCategory(this.selectedCategory.id)
          this.courses = response.data.data
        } else {
          const response = await api.courses.getAllCourses()
          this.courses = response.data.data
        }
      } catch (error) {
        console.error('Помилка при завантаженні курсів:', error)
        this.error = 'Не вдалося завантажити курси'
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      // Можна додати debounce для оптимізації
      // Тут просто повторно використовуємо filteredCourses
    },

    async setCategory(category) {
      this.selectedCategory = category
      this.fetchCourses()
    },

    async selectCourse(course) {
      try {
        await this.loadCourseById(course.id)

        // Update the URL
        this.router.push(`/admin/courses/${course.id}`)
      } catch (error) {
        console.error('Помилка при завантаженні деталей курсу:', error)
      }
    },

    async loadCourseById(courseId) {
      try {
        const response = await api.courses.getCourseById(courseId)
        this.selectedCourse = response.data.data
      } catch (error) {
        console.error('Помилка при завантаженні деталей курсу:', error)
      }
    },

    backToCoursesList() {
      this.selectedCourse = null
      this.router.push('/admin/courses')
    },

    // МОДАЛЬНІ ВІКНА
    openCourseModal(course = null) {
      if (course) {
        this.currentCourse = { ...course }
      } else {
        // Створення нового курсу
        this.currentCourse = {
          title: '',
          description: '',
          category_id: this.categories.length > 0 ? this.categories[0].id : null,
          price: 0,
          language: 'українська',
          requirements: '',
          what_you_learn: '',
          level_id: 1,
          meta_title: '',
          meta_description: '',
        }
      }
      this.showCourseModal = true
    },

    closeCourseModal() {
      this.showCourseModal = false
      this.currentCourse = null
    },

    openLessonModal(lesson = null) {
      if (!this.selectedCourse) {
        alert('Спочатку виберіть курс для додавання уроку')
        return
      }

      if (lesson) {
        this.currentLesson = { ...lesson }
      } else {
        // Створення нового уроку
        this.currentLesson = {
          title: '',
          content: '',
          video_url: '',
          attachments: [],
        }
      }
      this.showLessonModal = true
    },

    closeLessonModal() {
      this.showLessonModal = false
      this.currentLesson = null
    },

    openCategoryModal(category = null) {
      this.currentCategory = category
        ? { ...category }
        : {
            name: '',
            description: '',
            parent_id: null,
          }
      this.showCategoryModal = true
    },

    closeCategoryModal() {
      this.showCategoryModal = false
      this.currentCategory = null
    },

    // ЗБЕРЕЖЕННЯ ДАНИХ
    async saveCategory(categoryData) {
      try {
        if (categoryData.id) {
          await api.categories.updateCategory(categoryData.id, categoryData)
        } else {
          await api.categories.createCategory(categoryData)
        }
        this.closeCategoryModal()
        this.fetchCategories()
      } catch (error) {
        console.error('Помилка при збереженні категорії:', error)
      }
    },

    async saveCourse(courseData) {
      try {
        console.log('Дані курсу для збереження:', JSON.stringify(courseData, null, 2))

        // Переконуємося, що числові поля дійсно є числами
        const numericFields = [
          'price',
          'discount_price',
          'category_id',
          'level_id',
          'instructor_id',
        ]
        const formData = { ...courseData }

        numericFields.forEach((field) => {
          if (formData[field] !== null && formData[field] !== undefined) {
            formData[field] = Number(formData[field])
          }
        })

        if (formData.id) {
          // Редагування існуючого курсу
          console.log(`Оновлення курсу з ID: ${formData.id}`)

          // Виконуємо запит до API
          const response = await api.courses.updateCourse(formData.id, formData)
          console.log('Відповідь сервера при оновленні:', response.data)

          // Якщо курс вибраний і відкритий для перегляду, оновлюємо його дані
          if (this.selectedCourse && this.selectedCourse.id === formData.id) {
            const detailResponse = await api.courses.getCourseById(formData.id)
            this.selectedCourse = detailResponse.data.data
          }

          // Показуємо повідомлення про успішне оновлення
          alert('Курс успішно оновлено')
        } else {
          // Створення нового курсу
          console.log('Створення нового курсу')

          // Перевіряємо наявність обов'язкових полів
          const requiredFields = ['title', 'category_id', 'price', 'level_id']
          let missingFields = []

          for (const field of requiredFields) {
            if (!formData[field]) {
              missingFields.push(field)
            }
          }

          if (missingFields.length > 0) {
            alert(`Відсутні обов'язкові поля: ${missingFields.join(', ')}`)
            return
          }

          // Виконуємо запит до API
          const response = await api.courses.createCourse(formData)
          console.log('Відповідь сервера при створенні:', response.data)

          // Показуємо повідомлення про успішне створення
          alert('Новий курс успішно створено')
        }

        // Оновлюємо список курсів
        await this.fetchCourses()

        // Закриваємо модальне вікно
        this.closeCourseModal()
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error)

        // Детальне логування помилки
        if (error.response) {
          console.error('Статус відповіді:', error.response.status)
          console.error('Дані відповіді:', error.response.data)

          if (error.response.data && error.response.data.errors) {
            const validationErrors = error.response.data.errors
            const errorMessages = Object.keys(validationErrors)
              .map((field) => `${field}: ${validationErrors[field].join(', ')}`)
              .join('\n')

            alert(`Помилка валідації даних:\n${errorMessages}`)
          } else if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert(`Помилка при збереженні курсу: ${error.response.status}`)
          }
        } else if (error.request) {
          console.error('Запит був зроблений, але відповідь не отримана:', error.request)
          alert('Сервер не відповідає. Перевірте підключення до мережі.')
        } else {
          console.error('Помилка при налаштуванні запиту:', error.message)
          alert(`Помилка: ${error.message}`)
        }
      }
    },

    async saveLesson(lessonData) {
      try {
        if (this.selectedCourse) {
          if (lessonData.id) {
            await api.lessons.updateLesson(this.selectedCourse.id, lessonData.id, lessonData)
          } else {
            await api.lessons.createLesson(this.selectedCourse.id, lessonData)
          }

          // Оновлюємо дані курсу, щоб отримати оновлений список уроків
          const response = await api.courses.getCourseById(this.selectedCourse.id)
          this.selectedCourse = response.data.data

          this.closeLessonModal()
        }
      } catch (error) {
        console.error('Помилка при збереженні уроку:', error)
      }
    },

    // ПУБЛІКАЦІЯ
    async publishCourse(course) {
      // Перевіряємо, чи є уроки в курсі
      if (!course.lessons || course.lessons.length === 0) {
        alert('Неможливо опублікувати курс без уроків. Додайте щонайменше один урок.')
        return
      }

      try {
        await api.courses.publishCourse(course.id)

        // Оновлюємо дані
        if (this.selectedCourse && this.selectedCourse.id === course.id) {
          const response = await api.courses.getCourseById(course.id)
          this.selectedCourse = response.data.data
        }

        this.fetchCourses()
      } catch (error) {
        console.error('Помилка при публікації курсу:', error)
      }
    },

    async unpublishCourse(course) {
      try {
        await api.courses.unpublishCourse(course.id)

        // Оновлюємо дані
        if (this.selectedCourse && this.selectedCourse.id === course.id) {
          const response = await api.courses.getCourseById(course.id)
          this.selectedCourse = response.data.data
        }

        this.fetchCourses()
      } catch (error) {
        console.error('Помилка при знятті курсу з публікації:', error)
      }
    },

    async publishLesson(lesson) {
      try {
        if (this.selectedCourse) {
          await api.lessons.publishLesson(this.selectedCourse.id, lesson.id)

          // Оновлюємо дані курсу
          const response = await api.courses.getCourseById(this.selectedCourse.id)
          this.selectedCourse = response.data.data
        }
      } catch (error) {
        console.error('Помилка при публікації уроку:', error)
      }
    },

    // ВИДАЛЕННЯ
    // Метод для підтвердження видалення курсу
    confirmDeleteCourse(course) {
      this.confirmTitle = 'Видалити курс'
      this.confirmMessage = `Ви впевнені, що хочете видалити курс "${course.title}"? Ця дія є незворотною.`
      this.confirmAction = () => this.deleteCourse(course)
      this.showConfirmModal = true
    },

    // Метод для видалення курсу
    async deleteCourse(course) {
      try {
        console.log(`Видалення курсу з ID: ${course.id}`)

        // Показуємо індикатор завантаження
        this.loading = true

        // Виконуємо запит до API для видалення курсу
        const response = await api.courses.deleteCourse(course.id)

        console.log('Відповідь сервера:', response.data)

        // Якщо курс був відкритий у детальному перегляді, повертаємось до списку
        if (this.selectedCourse && this.selectedCourse.id === course.id) {
          this.backToCoursesList()
        }

        // Оновлюємо список курсів
        await this.fetchCourses()

        // Закриваємо модальне вікно підтвердження
        this.closeConfirmModal()

        // Показуємо повідомлення про успішне видалення
        alert('Курс успішно видалено')
      } catch (error) {
        console.error('Помилка при видаленні курсу:', error)

        // Детальне логування помилки
        if (error.response) {
          console.error('Статус відповіді:', error.response.status)
          console.error('Дані відповіді:', error.response.data)

          if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert(`Помилка при видаленні курсу: ${error.response.status}`)
          }
        } else if (error.request) {
          console.error('Запит був зроблений, але відповідь не отримана:', error.request)
          alert('Сервер не відповідає. Перевірте підключення до мережі.')
        } else {
          console.error('Помилка при налаштуванні запиту:', error.message)
          alert(`Помилка: ${error.message}`)
        }
      } finally {
        // Прибираємо індикатор завантаження
        this.loading = false

        // Закриваємо модальне вікно підтвердження незалежно від результату
        this.closeConfirmModal()
      }
    },

    confirmDeleteLesson(lesson) {
      this.confirmTitle = 'Видалити урок'
      this.confirmMessage = `Ви впевнені, що хочете видалити урок "${lesson.title}"? Ця дія є незворотною.`
      this.confirmAction = () => this.deleteLesson(lesson)
      this.showConfirmModal = true
    },

    async deleteLesson(lesson) {
      try {
        if (this.selectedCourse) {
          await api.lessons.deleteLesson(this.selectedCourse.id, lesson.id)

          // Оновлюємо дані курсу
          const response = await api.courses.getCourseById(this.selectedCourse.id)
          this.selectedCourse = response.data.data

          this.closeConfirmModal()
        }
      } catch (error) {
        console.error('Помилка при видаленні уроку:', error)
      }
    },

    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmTitle = ''
      this.confirmMessage = ''
      this.confirmAction = () => {}
    },
  },
}
</script>

<style scoped>
.courses-management {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
}

.course-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  align-items: center;
}

.filter-panel {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  font-weight: 500;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 200px;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.add-category {
  display: flex;
  align-items: center;
  color: #443bc9;
  border-top: 1px solid #e1e1e1;
  margin-top: 5px;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.add-button {
  display: flex;
  align-items: center;
  background-color: #443bc9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
}

.add-button:hover {
  background-color: #3730a3;
}

.courses-container {
  width: 100%;
}

.courses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.courses-grid > * {
  flex: 1 0 280px;
  max-width: calc(33.333% - 20px);
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #443bc9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-courses {
  width: 100%;
  text-align: center;
  padding: 50px;
  background-color: #f0f2f5;
  border-radius: 8px;
  color: #666;
}

/* Адаптивність */
@media screen and (max-width: 1200px) {
  .courses-grid > * {
    max-width: calc(50% - 20px);
  }
}

@media screen and (max-width: 768px) {
  .courses-grid > * {
    max-width: 100%;
  }

  .course-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-panel,
  .search-container,
  .add-button {
    width: 100%;
    margin-bottom: 10px;
  }

  .add-button {
    justify-content: center;
  }
}
</style>
