<template>
  <div class="courses-list">
    <!-- Заголовок та статистика -->
    <div class="list-header">
      <div class="list-info">
        <h2 class="list-title">{{ pageTitle }}</h2>
        <p class="courses-count" v-if="!loading">
          Знайдено {{ totalCourses }} {{ getCoursesWord(totalCourses) }}
        </p>
      </div>

      <!-- Швидка сортування -->
      <div class="quick-sort" v-if="!loading && courses.length > 0">
        <v-select
          v-model="quickSort"
          :items="quickSortOptions"
          item-title="text"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-sort"
          @update:model-value="handleQuickSort"
        />
      </div>
    </div>

    <!-- Активні фільтри -->
    <div class="active-filters" v-if="hasActiveFilters && !loading">
      <div class="active-filters-header">
        <span class="active-filters-title">Активні фільтри:</span>
        <v-btn variant="text" color="error" size="small" @click="clearFilters">
          Очистити все
        </v-btn>
      </div>

      <div class="filters-chips">
        <v-chip
          v-for="filter in activeFiltersChips"
          :key="filter.key"
          closable
          color="primary"
          variant="outlined"
          @click:close="removeFilter(filter.key)"
        >
          {{ filter.label }}: {{ filter.value }}
        </v-chip>
      </div>
    </div>

    <!-- Стан завантаження -->
    <div v-if="loading" class="loading-state">
      <div class="loading-content">
        <v-progress-circular indeterminate color="primary" size="50" />
        <p class="loading-text">Завантажуємо курси...</p>
      </div>
    </div>

    <!-- Помилка завантаження -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <v-icon size="64" color="error">mdi-alert-circle</v-icon>
        <h3 class="error-title">Помилка завантаження</h3>
        <p class="error-message">{{ error }}</p>
        <v-btn color="primary" variant="outlined" @click="loadCourses" prepend-icon="mdi-refresh">
          Спробувати знову
        </v-btn>
      </div>
    </div>

    <!-- Порожній результат -->
    <div v-else-if="courses.length === 0" class="empty-state">
      <div class="empty-content">
        <v-icon size="64" color="#ccc">mdi-book-open-outline</v-icon>
        <h3 class="empty-title">Курси не знайдено</h3>
        <p class="empty-message">
          {{
            hasActiveFilters
              ? 'Спробуйте змінити фільтри пошуку'
              : 'На даний момент немає доступних курсів'
          }}
        </p>
        <v-btn
          v-if="hasActiveFilters"
          color="primary"
          variant="outlined"
          @click="clearFilters"
          prepend-icon="mdi-filter-off"
        >
          Очистити фільтри
        </v-btn>
      </div>
    </div>

    <!-- Сітка курсів -->
    <div v-else class="courses-grid">
      <transition-group name="course-card" tag="div" class="grid-container">
        <course-card
          v-for="course in courses"
          :key="course.id"
          :course="course"
          @course-added-to-cart="onCourseAddedToCart"
          @show-message="onShowMessage"
        />
      </transition-group>
    </div>

    <!-- Пагінація -->
    <div v-if="totalPages > 1 && !loading" class="pagination-container">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        color="primary"
        variant="outlined"
        @update:model-value="handlePageChange"
      />

      <!-- Інформація про сторінки -->
      <div class="pagination-info">
        <span>
          Сторінка {{ currentPage }} з {{ totalPages }} ({{ startIndex }}-{{ endIndex }} з
          {{ totalCourses }})
        </span>
      </div>
    </div>

    <!-- Кнопка "Завантажити ще" для мобільних -->
    <div v-if="hasMoreCourses && !loading" class="load-more-container d-md-none">
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        block
        :loading="loadingMore"
        @click="loadMoreCourses"
        prepend-icon="mdi-reload"
      >
        Завантажити ще курси
      </v-btn>
    </div>
  </div>
</template>

<script>
import CourseCard from './CourseCard.vue'
import { coursesApi } from '@/services/api'

export default {
  name: 'CoursesList',
  components: {
    CourseCard,
  },
  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    pageTitle: {
      type: String,
      default: 'Всі курси',
    },
  },
  emits: ['update-filters', 'course-added-to-cart', 'show-message'],
  data() {
    return {
      courses: [],
      loading: true,
      loadingMore: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCourses: 0,
      perPage: 12,
      quickSort: 'popular',

      quickSortOptions: [
        { text: 'За популярністю', value: 'popular' },
        { text: 'За новизною', value: 'latest' },
        { text: 'За рейтингом', value: 'rating' },
        { text: 'За ціною (↑)', value: 'price_asc' },
        { text: 'За ціною (↓)', value: 'price_desc' },
        { text: 'За алфавітом', value: 'title_asc' },
      ],
    }
  },
  computed: {
    hasActiveFilters() {
      return Object.keys(this.filters).some((key) => {
        const value = this.filters[key]
        if (key === 'priceRange') {
          return value && (value[0] > 0 || value[1] < 5000)
        }
        return value !== null && value !== undefined && value !== ''
      })
    },

    activeFiltersChips() {
      const chips = []

      if (this.filters.search) {
        chips.push({
          key: 'search',
          label: 'Пошук',
          value: this.filters.search,
        })
      }

      if (this.filters.category) {
        chips.push({
          key: 'category',
          label: 'Категорія',
          value: this.getCategoryName(this.filters.category),
        })
      }

      if (this.filters.level) {
        chips.push({
          key: 'level',
          label: 'Рівень',
          value: this.getLevelName(this.filters.level),
        })
      }

      if (this.filters.instructor) {
        chips.push({
          key: 'instructor',
          label: 'Інструктор',
          value: this.getInstructorName(this.filters.instructor),
        })
      }

      if (this.filters.language) {
        chips.push({
          key: 'language',
          label: 'Мова',
          value: this.filters.language,
        })
      }

      if (this.filters.duration) {
        chips.push({
          key: 'duration',
          label: 'Тривалість',
          value: this.getDurationText(this.filters.duration),
        })
      }

      if (this.filters.rating) {
        chips.push({
          key: 'rating',
          label: 'Рейтинг',
          value: `від ${this.filters.rating} зірок`,
        })
      }

      if (
        this.filters.priceRange &&
        (this.filters.priceRange[0] > 0 || this.filters.priceRange[1] < 5000)
      ) {
        chips.push({
          key: 'priceRange',
          label: 'Ціна',
          value: `${this.filters.priceRange[0]}-${this.filters.priceRange[1]} ₴`,
        })
      }

      return chips
    },

    hasMoreCourses() {
      return this.currentPage < this.totalPages
    },

    startIndex() {
      return (this.currentPage - 1) * this.perPage + 1
    },

    endIndex() {
      return Math.min(this.currentPage * this.perPage, this.totalCourses)
    },
  },
  watch: {
    filters: {
      handler() {
        this.currentPage = 1
        this.loadCourses()
      },
      deep: true,
    },
  },
  async mounted() {
    await this.loadCourses()
  },
  methods: {
    async loadCourses() {
      this.loading = true
      this.error = null

      try {
        // Завантажуємо всі курси з API
        const response = await coursesApi.getAllCourses(1, 1000) // Завантажуємо багато курсів

        // Обробляємо відповідь
        let allCoursesData = []
        if (response.data?.success && response.data?.data) {
          allCoursesData = response.data.data
        } else if (response.data && Array.isArray(response.data)) {
          allCoursesData = response.data
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          allCoursesData = response.data.data
        }

        // Фільтруємо тільки опубліковані курси
        const publishedCourses = allCoursesData.filter((course) => course.is_published === true)

        // Застосовуємо клієнтські фільтри
        let filteredCourses = this.applyClientFilters(publishedCourses)

        // Сортування
        filteredCourses = this.applySorting(filteredCourses)

        // Розбиваємо на сторінки
        this.totalCourses = filteredCourses.length
        this.totalPages = Math.ceil(this.totalCourses / this.perPage)

        const startIndex = (this.currentPage - 1) * this.perPage
        const endIndex = startIndex + this.perPage
        this.courses = filteredCourses.slice(startIndex, endIndex)

        console.log('Завантажено курсів:', this.totalCourses, 'Показано:', this.courses.length)
      } catch (error) {
        console.error('Помилка завантаження курсів:', error)
        this.error = error.response?.data?.message || 'Помилка завантаження курсів'
        this.courses = []
        this.totalCourses = 0
        this.totalPages = 0
      } finally {
        this.loading = false
      }
    },

    applyClientFilters(courses) {
      let filtered = [...courses]

      // Фільтр за пошуком
      if (this.filters.search && this.filters.search.trim()) {
        const searchTerm = this.filters.search.toLowerCase().trim()
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(searchTerm) ||
            (course.description && course.description.toLowerCase().includes(searchTerm)),
        )
      }

      // Фільтр за категорією
      if (this.filters.category) {
        filtered = filtered.filter((course) => course.category_id == this.filters.category)
      }

      // Фільтр за рівнем
      if (this.filters.level) {
        filtered = filtered.filter((course) => course.level_id == this.filters.level)
      }

      // Фільтр за інструктором
      if (this.filters.instructor) {
        filtered = filtered.filter((course) => course.instructor_id == this.filters.instructor)
      }

      // Фільтр за мовою
      if (this.filters.language) {
        filtered = filtered.filter(
          (course) =>
            course.language &&
            course.language.toLowerCase() === this.filters.language.toLowerCase(),
        )
      }

      // Фільтр за ціною
      if (
        this.filters.priceRange &&
        (this.filters.priceRange[0] > 0 || this.filters.priceRange[1] < 5000)
      ) {
        filtered = filtered.filter((course) => {
          const price = parseFloat(
            course.current_price || course.discount_price || course.price || 0,
          )
          return price >= this.filters.priceRange[0] && price <= this.filters.priceRange[1]
        })
      }

      // Фільтр за рейтингом
      if (this.filters.rating) {
        filtered = filtered.filter(
          (course) => course.rating && parseFloat(course.rating) >= this.filters.rating,
        )
      }

      // Фільтр за тривалістю (якщо є поле duration)
      if (this.filters.duration) {
        const [min, max] = this.filters.duration
          .split('-')
          .map((v) => (v === '+' ? Infinity : parseInt(v)))
        filtered = filtered.filter((course) => {
          if (!course.duration) return false
          const duration = parseInt(course.duration)
          return duration >= min && (max === Infinity ? true : duration <= max)
        })
      }

      return filtered
    },

    applySorting(courses) {
      const sortBy = this.quickSort || this.filters.sortBy || 'popular'

      return [...courses].sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            // Сортуємо за кількістю студентів
            const studentsA = parseInt(a.students_count || 0)
            const studentsB = parseInt(b.students_count || 0)
            return studentsB - studentsA

          case 'latest':
            // Сортуємо за датою створення
            const dateA = new Date(a.created_at || 0)
            const dateB = new Date(b.created_at || 0)
            return dateB - dateA

          case 'rating':
            // Сортуємо за рейтингом
            const ratingA = parseFloat(a.rating || 0)
            const ratingB = parseFloat(b.rating || 0)
            return ratingB - ratingA

          case 'price_asc':
            // Сортуємо за ціною (зростання)
            const priceA = parseFloat(a.current_price || a.discount_price || a.price || 0)
            const priceB = parseFloat(b.current_price || b.discount_price || b.price || 0)
            return priceA - priceB

          case 'price_desc':
            // Сортуємо за ціною (спадання)
            const priceDescA = parseFloat(a.current_price || a.discount_price || a.price || 0)
            const priceDescB = parseFloat(b.current_price || b.discount_price || b.price || 0)
            return priceDescB - priceDescA

          case 'title_asc':
            // Сортуємо за алфавітом
            return a.title.localeCompare(b.title, 'uk-UA')

          default:
            return 0
        }
      })
    },

    async loadMoreCourses() {
      if (!this.hasMoreCourses || this.loadingMore) return

      this.loadingMore = true
      try {
        this.currentPage++
        await this.loadCourses()
      } catch (error) {
        this.currentPage--
        console.error('Помилка завантаження додаткових курсів:', error)
      } finally {
        this.loadingMore = false
      }
    },

    handlePageChange(page) {
      this.currentPage = page
      this.loadCourses()

      // Прокручуємо до верху списку
      this.$nextTick(() => {
        this.$el.scrollIntoView({ behavior: 'smooth' })
      })
    },

    handleQuickSort(sortValue) {
      this.quickSort = sortValue
      this.currentPage = 1
      this.loadCourses()
    },

    getCoursesWord(count) {
      if (count % 10 === 1 && count % 100 !== 11) {
        return 'курс'
      } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'курси'
      } else {
        return 'курсів'
      }
    },

    getCategoryName(categoryId) {
      // Тут можна зберігати мапу категорій або отримувати з пропсів
      return `Категорія ${categoryId}`
    },

    getLevelName(levelId) {
      const levels = {
        1: 'Початковий',
        2: 'Середній',
        3: 'Просунутий',
      }
      return levels[levelId] || `Рівень ${levelId}`
    },

    getInstructorName(instructorId) {
      return `Інструктор ${instructorId}`
    },

    getDurationText(duration) {
      const durations = {
        '0-60': 'До 1 години',
        '60-180': '1-3 години',
        '180-360': '3-6 годин',
        '360-720': '6-12 годин',
        '720+': 'Більше 12 годин',
      }
      return durations[duration] || duration
    },

    removeFilter(filterKey) {
      const newFilters = { ...this.filters }

      if (filterKey === 'priceRange') {
        newFilters[filterKey] = [0, 5000]
      } else {
        delete newFilters[filterKey]
      }

      this.$emit('update-filters', newFilters)
    },

    clearFilters() {
      this.$emit('update-filters', {})
    },

    onCourseAddedToCart(course) {
      this.$emit('course-added-to-cart', course)
    },

    onShowMessage(message) {
      this.$emit('show-message', message)
    },
  },
}
</script>

<style scoped>
.courses-list {
  flex: 1;
}

/* Заголовок списку */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.list-info {
  flex: 1;
}

.list-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color);
  margin: 0 0 0.5rem 0;
}

.courses-count {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1rem;
  color: var(--secondary-text-color);
  margin: 0;
}

.quick-sort {
  min-width: 200px;
}

/* Активні фільтри */
.active-filters {
  background-color: var(--light-gray);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.active-filters-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-color);
}

.filters-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Стани завантаження */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-content,
.error-content,
.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.loading-text,
.error-message,
.empty-message {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1.1rem;
  color: var(--secondary-text-color);
  margin: 1rem 0 1.5rem 0;
  line-height: 1.6;
}

.error-title,
.empty-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 1rem 0 0.5rem 0;
}

/* Сітка курсів */
.courses-grid {
  margin-bottom: 3rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Анімації для карток */
.course-card-enter-active,
.course-card-leave-active {
  transition: all 0.3s ease;
}

.course-card-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.course-card-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.course-card-move {
  transition: transform 0.3s ease;
}

/* Пагінація */
.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.pagination-info {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
}

/* Кнопка завантаження ще */
.load-more-container {
  margin-top: 2rem;
  text-align: center;
}

/* Responsive стилі */
@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .list-title {
    font-size: 1.5rem;
  }

  .quick-sort {
    min-width: auto;
  }

  .grid-container {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .active-filters-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .filters-chips {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 2rem 1rem;
  }
}
</style>
