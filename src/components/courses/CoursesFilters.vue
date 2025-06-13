<template>
  <div class="courses-filters">
    <!-- Мобільна кнопка фільтрів -->
    <div class="mobile-filter-toggle d-md-none">
      <v-btn
        variant="outlined"
        color="primary"
        append-icon="mdi-filter-variant"
        @click="showMobileFilters = !showMobileFilters"
        block
      >
        Фільтри
        <v-badge v-if="activeFiltersCount > 0" :content="activeFiltersCount" color="error" inline />
      </v-btn>
    </div>

    <!-- Фільтри (десктоп завжди видимі, мобільні за потреби) -->
    <v-card
      class="filters-container"
      :class="{ 'mobile-hidden': !showMobileFilters }"
      elevation="2"
    >
      <v-card-title class="filters-header">
        <span class="filters-title">Фільтри курсів</span>
        <v-btn
          v-if="activeFiltersCount > 0"
          variant="text"
          color="error"
          size="small"
          @click="clearAllFilters"
        >
          Очистити все
        </v-btn>
      </v-card-title>

      <v-card-text class="filters-content">
        <!-- Пошук -->
        <div class="filter-section">
          <v-label class="filter-label">Пошук</v-label>
          <v-text-field
            v-model="localFilters.search"
            placeholder="Введіть назву курсу..."
            clearable
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            @update:model-value="debounceSearch"
          />
        </div>

        <!-- Категорії -->
        <div class="filter-section">
          <v-label class="filter-label">Категорія</v-label>
          <v-select
            v-model="localFilters.category"
            :items="categoriesOptions"
            item-title="name"
            item-value="id"
            placeholder="Всі категорії"
            clearable
            variant="outlined"
            density="compact"
            :loading="loadingCategories"
            prepend-inner-icon="mdi-folder-outline"
          />
        </div>

        <!-- Рівень складності -->
        <div class="filter-section">
          <v-label class="filter-label">Рівень складності</v-label>
          <v-select
            v-model="localFilters.level"
            :items="levelsOptions"
            item-title="name"
            item-value="id"
            placeholder="Всі рівні"
            clearable
            variant="outlined"
            density="compact"
            :loading="loadingLevels"
            prepend-inner-icon="mdi-signal"
          />
        </div>

        <!-- Інструктор -->
        <div class="filter-section">
          <v-label class="filter-label">Інструктор</v-label>
          <v-select
            v-model="localFilters.instructor"
            :items="instructorsOptions"
            item-title="full_name"
            item-value="id"
            placeholder="Всі інструктори"
            clearable
            variant="outlined"
            density="compact"
            :loading="loadingInstructors"
            prepend-inner-icon="mdi-account-outline"
          />
        </div>

        <!-- Ціновий діапазон -->
        <div class="filter-section">
          <v-label class="filter-label">
            Ціна (₴): {{ localFilters.priceRange[0] }} - {{ localFilters.priceRange[1] }}
          </v-label>
          <v-range-slider
            v-model="localFilters.priceRange"
            :min="0"
            :max="5000"
            :step="50"
            thumb-label
            color="primary"
            @end="applyFilters"
          />
        </div>

        <!-- Мова курсу -->
        <div class="filter-section">
          <v-label class="filter-label">Мова</v-label>
          <v-select
            v-model="localFilters.language"
            :items="languageOptions"
            placeholder="Всі мови"
            clearable
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-translate"
          />
        </div>

        <!-- Тривалість курсу -->
        <div class="filter-section">
          <v-label class="filter-label">Тривалість</v-label>
          <v-select
            v-model="localFilters.duration"
            :items="durationOptions"
            item-title="text"
            item-value="value"
            placeholder="Будь-яка тривалість"
            clearable
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-clock-outline"
          />
        </div>

        <!-- Рейтинг -->
        <div class="filter-section">
          <v-label class="filter-label">Мінімальний рейтинг</v-label>
          <v-select
            v-model="localFilters.rating"
            :items="ratingOptions"
            item-title="text"
            item-value="value"
            placeholder="Будь-який рейтинг"
            clearable
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-star"
          />
        </div>

        <!-- Сортування -->
        <div class="filter-section">
          <v-label class="filter-label">Сортування</v-label>
          <v-select
            v-model="localFilters.sortBy"
            :items="sortOptions"
            item-title="text"
            item-value="value"
            placeholder="За популярністю"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-sort"
          />
        </div>

        <!-- Мобільні кнопки дій -->
        <div class="mobile-actions d-md-none">
          <v-btn
            variant="outlined"
            color="secondary"
            @click="showMobileFilters = false"
            block
            class="mb-3"
          >
            Застосувати фільтри
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { categoriesApi, coursesApi } from '@/services/api'

export default {
  name: 'CoursesFilters',
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'apply-filters'],
  data() {
    return {
      showMobileFilters: false,
      loadingCategories: false,
      loadingLevels: false,
      loadingInstructors: false,
      searchTimeout: null,

      localFilters: {
        search: '',
        category: null,
        level: null,
        instructor: null,
        priceRange: [0, 5000],
        language: null,
        duration: null,
        rating: null,
        sortBy: 'popular',
      },

      categories: [],
      levels: [],
      instructors: [],

      languageOptions: ['Українська', 'Англійська', 'Польська', 'Російська'],

      durationOptions: [
        { text: 'До 1 години', value: '0-60' },
        { text: '1-3 години', value: '60-180' },
        { text: '3-6 годин', value: '180-360' },
        { text: '6-12 годин', value: '360-720' },
        { text: 'Більше 12 годин', value: '720+' },
      ],

      ratingOptions: [
        { text: '4.5+ зірок', value: 4.5 },
        { text: '4+ зірки', value: 4.0 },
        { text: '3.5+ зірок', value: 3.5 },
        { text: '3+ зірки', value: 3.0 },
      ],

      sortOptions: [
        { text: 'За популярністю', value: 'popular' },
        { text: 'За новизною', value: 'latest' },
        { text: 'За рейтингом', value: 'rating' },
        { text: 'За ціною (зростання)', value: 'price_asc' },
        { text: 'За ціною (спадання)', value: 'price_desc' },
        { text: 'За алфавітом', value: 'title_asc' },
      ],
    }
  },
  computed: {
    activeFiltersCount() {
      let count = 0
      if (this.localFilters.search) count++
      if (this.localFilters.category) count++
      if (this.localFilters.level) count++
      if (this.localFilters.instructor) count++
      if (this.localFilters.language) count++
      if (this.localFilters.duration) count++
      if (this.localFilters.rating) count++
      if (this.localFilters.priceRange[0] > 0 || this.localFilters.priceRange[1] < 5000) count++
      return count
    },

    categoriesOptions() {
      return [{ id: null, name: 'Всі категорії' }, ...this.categories]
    },

    levelsOptions() {
      return [{ id: null, name: 'Всі рівні' }, ...this.levels]
    },

    instructorsOptions() {
      return [{ id: null, full_name: 'Всі інструктори' }, ...this.instructors]
    },
  },
  watch: {
    modelValue: {
      handler(newValue) {
        this.localFilters = { ...this.localFilters, ...newValue }
      },
      deep: true,
      immediate: true,
    },

    localFilters: {
      handler(newValue) {
        // Віддаємо фільтри вгору не для пошуку
        if (!this.searchTimeout) {
          this.applyFilters()
        }
      },
      deep: true,
    },
  },
  async mounted() {
    await Promise.all([this.loadCategories(), this.loadLevels(), this.loadInstructors()])
  },
  methods: {
    async loadCategories() {
      this.loadingCategories = true
      try {
        const response = await categoriesApi.getActiveCategories()
        this.categories = response.data.data
      } catch (error) {
        console.error('Помилка завантаження категорій:', error)
      } finally {
        this.loadingCategories = false
      }
    },

    async loadLevels() {
      this.loadingLevels = true
      try {
        const response = await coursesApi.getAllLevels()
        this.levels = response.data.data
      } catch (error) {
        console.error('Помилка завантаження рівнів:', error)
      } finally {
        this.loadingLevels = false
      }
    },

    async loadInstructors() {
      this.loadingInstructors = true
      try {
        const response = await coursesApi.getAllInstructors()
        this.instructors = response.data || []
      } catch (error) {
        console.error('Помилка завантаження інструкторів:', error)
        this.instructors = []
      } finally {
        this.loadingInstructors = false
      }
    },

    debounceSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchTimeout = setTimeout(() => {
        this.applyFilters()
        this.searchTimeout = null
      }, 500)
    },

    applyFilters() {
      this.$emit('update:modelValue', { ...this.localFilters })
      this.$emit('apply-filters', { ...this.localFilters })
    },

    clearAllFilters() {
      this.localFilters = {
        search: '',
        category: null,
        level: null,
        instructor: null,
        priceRange: [0, 5000],
        language: null,
        duration: null,
        rating: null,
        sortBy: 'popular',
      }
      this.applyFilters()
    },
  },
}
</script>

<style scoped>
.courses-filters {
  margin-bottom: 2rem;
}

.mobile-filter-toggle {
  margin-bottom: 1rem;
}

.filters-container {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mobile-hidden {
  display: none;
}

.filters-header {
  background-color: var(--light-gray);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-color);
}

.filters-content {
  padding: 1.5rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-label {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  display: block;
}

.mobile-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

/* Responsive стилі */
@media (min-width: 768px) {
  .mobile-hidden {
    display: block !important;
  }

  .filters-container {
    position: sticky;
    top: 120px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }
}

@media (max-width: 767px) {
  .filters-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
    max-height: 100vh;
    overflow-y: auto;
  }

  .filters-header {
    position: sticky;
    top: 0;
    z-index: 1001;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* Кастомні стилі для range slider */
:deep(.v-slider-thumb__label) {
  background-color: var(--primary-color) !important;
}

:deep(.v-slider__track) {
  background-color: var(--border-color) !important;
}

:deep(.v-slider__track-fill) {
  background-color: var(--primary-color) !important;
}
</style>
