<!-- src\components\admin\courses-management\CoursesList.vue -->
<template>
  <div class="courses-list">
    <!-- Навігаційне меню для управління курсами -->
    <div class="course-nav">
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
            <div class="dropdown-item add-category" @click="$emit('open-category-modal')">
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
      <button class="add-button" @click="$emit('open-course-modal')">
        <v-icon small>mdi-plus</v-icon>
        Додати курс
      </button>
    </div>

    <!-- Грід для відображення курсів -->
    <div class="courses-container">
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
          @click="$emit('select-course', course)"
          @edit="$emit('edit-course', course)"
          @publish="$emit('publish-course', course)"
          @unpublish="$emit('unpublish-course', course)"
          @delete="$emit('delete-course', course)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CourseCard from './CourseCard.vue'
import api from '@/services/api.js'

export default {
  name: 'CoursesList',
  components: {
    CourseCard,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      courses: [],
      categories: [],
      searchQuery: '',
      selectedCategory: null,
      error: null,
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
      this.$emit('update:loading', true)
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
        this.$emit('update:loading', false)
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
  },
}
</script>

<style scoped>
.courses-list {
  width: 100%;
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
