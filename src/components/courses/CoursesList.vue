<template>
  <div class="courses-list">
    <div class="courses-header">
      <h1>{{ pageTitle }}</h1>
      <div class="courses-search">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Пошук курсів..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="courses-content">
      <CoursesFilters @filters-changed="handleFiltersChange" />

      <div class="courses-grid" v-if="!loading">
        <CourseCard
          v-for="course in filteredCourses"
          :key="course.id"
          :course="course"
        />
      </div>

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Завантаження курсів...</p>
      </div>

      <div v-if="!loading && filteredCourses.length === 0" class="no-courses">
        <p>Курси не знайдено</p>
      </div>
    </div>
  </div>
</template>

<script>
import { coursesApi } from '@/services/api'
import CourseCard from './CourseCard.vue'
import CoursesFilters from './CoursesFilters.vue'

export default {
  name: 'CoursesList',
  components: {
    CourseCard,
    CoursesFilters,
  },
  props: {
    categoryId: {
      type: [String, Number],
      default: null,
    },
    levelId: {
      type: [String, Number],
      default: null,
    },
    instructorId: {
      type: [String, Number],
      default: null,
    },
    query: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      courses: [],
      filteredCourses: [],
      loading: true,
      searchQuery: '',
      filters: {
        categories: [],
        levels: [],
        priceRange: {
          min: null,
          max: null,
        },
        showOnlyDiscounted: false,
      },
    }
  },
  computed: {
    pageTitle() {
      if (this.categoryId) return 'Курси за категорією'
      if (this.levelId) return 'Курси за рівнем'
      if (this.instructorId) return 'Курси викладача'
      if (this.query) return `Результати пошуку: ${this.query}`
      return 'Всі курси'
    },
  },
  watch: {
    categoryId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.filters.categories = [parseInt(newVal)]
        }
      },
    },
    levelId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.filters.levels = [parseInt(newVal)]
        }
      },
    },
    query: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.searchQuery = newVal
        }
      },
    },
  },
  methods: {
    async loadCourses() {
      this.loading = true
      try {
        let response

        if (this.categoryId) {
          response = await coursesApi.getCoursesByCategory(this.categoryId)
        } else if (this.levelId) {
          response = await coursesApi.getCoursesByLevel(this.levelId)
        } else if (this.instructorId) {
          response = await coursesApi.getCoursesByInstructor(this.instructorId)
        } else if (this.query) {
          response = await coursesApi.searchCourses(this.query)
        } else {
          response = await coursesApi.getAllCourses()
        }

        this.courses = (response.data.data || []).filter(course => course.is_published)
        this.applyFilters()
      } catch (error) {
        console.error('Помилка завантаження курсів:', error)
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.applyFilters()
    },
    handleFiltersChange(filters) {
      this.filters = filters
      this.applyFilters()
    },
    applyFilters() {
      let filtered = [...this.courses]

      // Пошук за запитом
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
        )
      }

      // Фільтрація за категоріями
      if (this.filters.categories.length > 0) {
        filtered = filtered.filter((course) =>
          this.filters.categories.includes(course.category_id)
        )
      }

      // Фільтрація за рівнями
      if (this.filters.levels.length > 0) {
        filtered = filtered.filter((course) =>
          this.filters.levels.includes(course.level_id)
        )
      }

      // Фільтрація за ціною
      if (this.filters.priceRange.min !== null) {
        filtered = filtered.filter(
          (course) => course.current_price >= this.filters.priceRange.min
        )
      }
      if (this.filters.priceRange.max !== null) {
        filtered = filtered.filter(
          (course) => course.current_price <= this.filters.priceRange.max
        )
      }

      // Фільтрація за знижками
      if (this.filters.showOnlyDiscounted) {
        filtered = filtered.filter((course) => course.is_on_discount)
      }

      this.filteredCourses = filtered
    },
  },
  created() {
    this.loadCourses()
  },
}
</script>

<style scoped>
.courses-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.courses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.courses-header h1 {
  font-size: 2rem;
  color: #2c3e50;
}

.courses-search input {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  font-size: 1rem;
}

.courses-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(360deg)
  }
}

.no-courses {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
