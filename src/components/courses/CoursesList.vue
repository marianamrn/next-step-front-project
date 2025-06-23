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
      <CoursesFilters v-if="!publicMode" @filters-changed="handleFiltersChange" />

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

      <div v-if="publicMode && lastPage > 1 && !loading" class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="loadCourses(currentPage - 1)"
        >Назад</button>
        <span>Сторінка {{ currentPage }} з {{ lastPage }}</span>
        <button
          :disabled="currentPage === lastPage"
          @click="loadCourses(currentPage + 1)"
        >Вперед</button>
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
    publicMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      courses: [],
      filteredCourses: [],
      loading: true,
      searchQuery: '',
      filters: {
        category: null,
        level: null,
        duration: null,
        language: null,
        priceRange: [0, 10000],
        showOnlyDiscounted: false,
      },
      currentPage: 1,
      lastPage: 1,
      paginationLinks: [],
      perPage: 15,
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
          this.filters.category = parseInt(newVal)
        }
      },
    },
    levelId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.filters.level = parseInt(newVal)
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
    searchQuery: {
      handler() {
        this.applyFilters()
      },
    },
    filters: {
      handler() {
        this.applyFilters()
      },
      deep: true,
    },
  },
  methods: {
    async loadCourses(page = 1) {
      this.loading = true
      try {
        let response
        if (this.publicMode) {
          response = await coursesApi.getOnlyCourses({ page: page, per_page: this.perPage })
          const data = response.data.data || []
          this.courses = data
          if (this.searchQuery && this.searchQuery.trim() !== '') {
            const query = this.searchQuery.trim().toLowerCase()
            this.filteredCourses = data.filter(course => course.title.toLowerCase().includes(query))
          } else {
            this.filteredCourses = data
          }
          this.currentPage = response.data.meta?.current_page || 1
          this.lastPage = response.data.meta?.last_page || 1
          this.paginationLinks = response.data.meta?.links || []
        } else {
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
        }
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
      console.log('Отримані фільтри у CoursesList:', filters)
      this.filters = { ...filters }
      this.applyFilters()
    },
    clearFilters() {
      this.filters = {
        category: null,
        level: null,
        duration: null,
        language: null,
        priceRange: [0, 10000],
      }
      this.filteredCourses = [...this.courses]
    },
    applyFilters() {
      let filtered = [...this.courses]
      // Пошук по назві
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const query = this.searchQuery.trim().toLowerCase()
        filtered = filtered.filter(course => course.title.toLowerCase().includes(query))
      }
      // Фільтрація за категорією
      if (this.filters.category) {
        filtered = filtered.filter((course) => Number(course.category_id) === Number(this.filters.category))
      }
      // Фільтрація за рівнем
      if (this.filters.level) {
        filtered = filtered.filter((course) => Number(course.level_id) === Number(this.filters.level))
      }
      // Фільтрація за тривалістю
      if (this.filters.duration) {
        const [min, max] = this.filters.duration.split('-').map(v => v === '+' ? Infinity : parseInt(v))
        filtered = filtered.filter((course) => {
          if (!course.duration_minutes) return false
          const duration = parseInt(course.duration_minutes)
          return duration >= min && (max === Infinity ? true : duration <= max)
        })
      }
      // Фільтрація за мовою
      if (this.filters.language) {
        filtered = filtered.filter((course) => {
          const courseLanguage = course.language?.toLowerCase() || ''
          const filterLanguage = this.filters.language.toLowerCase()
          return courseLanguage === filterLanguage
        })
      }
      // Фільтрація за ціною
      if (this.filters.priceRange && this.filters.priceRange.length === 2) {
        const [min, max] = this.filters.priceRange
        filtered = filtered.filter((course) => {
          const price = Number(course.current_price || course.discount_price || course.price || 0)
          return price >= min && price <= max
        })
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}
.pagination button {
  padding: 0.5rem 1.5rem;
  border: none;
  background: #3498db;
  color: #fff;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
