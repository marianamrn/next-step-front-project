<!-- src\components\admin\courses-management\CourseManagement.vue -->
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
        />
      </div>
    </div>

    <!-- Детальна інформація про вибраний курс -->
    <course-detail
      v-if="selectedCourse"
      :course="selectedCourse"
      @back="selectedCourse = null"
      @edit-course="openCourseModal"
      @publish-course="publishCourse"
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
        const response = await api.courses.getCourseById(course.id)
        this.selectedCourse = response.data.data
      } catch (error) {
        console.error('Помилка при завантаженні деталей курсу:', error)
      }
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
        if (courseData.id) {
          await api.courses.updateCourse(courseData.id, courseData)

          // Якщо курс вибраний і відкритий для перегляду, оновлюємо його дані
          if (this.selectedCourse && this.selectedCourse.id === courseData.id) {
            const response = await api.courses.getCourseById(courseData.id)
            this.selectedCourse = response.data.data
          }
        } else {
          const response = await api.courses.createCourse(courseData)
          // Додаємо новий курс до списку
          this.fetchCourses()
        }
        this.closeCourseModal()
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error)
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
