<template>
  <div class="courses-page">
    <!-- Заголовок сторінки -->
    <section class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="breadcrumbs">
            <v-breadcrumbs :items="breadcrumbItems" color="primary" class="pa-0">
              <template v-slot:divider>
                <v-icon icon="mdi-chevron-right" size="small" />
              </template>
              <template v-slot:item="{ item }">
                <v-breadcrumbs-item
                  :href="item.href"
                  :disabled="item.disabled"
                  class="breadcrumb-item"
                >
                  {{ item.title }}
                </v-breadcrumbs-item>
              </template>
            </v-breadcrumbs>
          </div>

          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-description" v-if="pageDescription">
            {{ pageDescription }}
          </p>
        </div>
      </div>
    </section>

    <!-- Основний контент -->
    <section class="page-content">
      <div class="container">
        <div class="content-layout">
          <!-- Бічна панель з фільтрами -->
          <aside class="filters-sidebar">
            <courses-filters v-model="filters" @apply-filters="handleFiltersUpdate" />
          </aside>

          <!-- Основний контент -->
          <main class="main-content">
            <courses-list
              :filters="filters"
              :page-title="listTitle"
              @update-filters="handleFiltersUpdate"
              @course-added-to-cart="handleCourseAddedToCart"
              @show-message="showMessage"
            />
          </main>
        </div>
      </div>
    </section>

    <!-- Snackbar для повідомлень -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Закрити </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import CoursesFilters from '@/components/courses/CoursesFilters.vue'
import CoursesList from '@/components/courses/CoursesList.vue'
import { categoriesApi } from '@/services/api'

export default {
  name: 'CoursesPage',
  components: {
    CoursesFilters,
    CoursesList,
  },
  data() {
    return {
      filters: {},
      categories: [],
      levels: [],
      instructors: [],
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        timeout: 4000,
      },
    }
  },
  computed: {
    breadcrumbItems() {
      const items = [
        {
          title: 'Головна',
          href: '/home',
          disabled: false,
        },
        {
          title: 'Курси',
          href: '/courses',
          disabled: true,
        },
      ]

      // Додаємо хлібні крихти на основі активних фільтрів
      if (this.filters.category) {
        const category = this.categories.find((cat) => cat.id == this.filters.category)
        if (category) {
          items.push({
            title: category.name,
            href: `/courses?category=${category.id}`,
            disabled: true,
          })
        }
      }

      return items
    },

    pageTitle() {
      if (this.filters.category) {
        const category = this.categories.find((cat) => cat.id == this.filters.category)
        return category ? `Курси: ${category.name}` : 'Курси'
      }

      if (this.filters.search) {
        return `Пошук: "${this.filters.search}"`
      }

      return 'Всі курси'
    },

    pageDescription() {
      if (this.filters.category) {
        const category = this.categories.find((cat) => cat.id == this.filters.category)
        return category?.description || `Всі курси в категорії ${category?.name}`
      }

      if (this.filters.search) {
        return `Результати пошуку за запитом "${this.filters.search}"`
      }

      return 'Оберіть курс, який підходить саме вам. Навчайтеся у зручному темпі з досвідченими викладачами.'
    },

    listTitle() {
      if (this.filters.category) {
        const category = this.categories.find((cat) => cat.id == this.filters.category)
        return category ? category.name : 'Курси'
      }

      if (this.filters.search) {
        return `"${this.filters.search}"`
      }

      return 'Всі курси'
    },
  },
  async mounted() {
    // Завантажуємо довідкові дані
    await this.loadReferenceData()

    // Обробляємо query параметри з URL
    this.handleRouteQuery()
  },
  watch: {
    '$route.query': {
      handler() {
        this.handleRouteQuery()
      },
      deep: true,
    },
  },
  methods: {
    async loadReferenceData() {
      try {
        // Завантажуємо категорії
        const categoriesResponse = await categoriesApi.getAllCategories()
        let categoriesData = []

        if (categoriesResponse.data?.success && categoriesResponse.data?.data) {
          categoriesData = categoriesResponse.data.data
        } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          categoriesData = categoriesResponse.data
        }

        this.categories = categoriesData.filter((cat) => cat.status !== 'inactive')
      } catch (error) {
        console.error('Помилка завантаження довідкових даних:', error)
      }
    },

    handleRouteQuery() {
      const query = this.$route.query
      const newFilters = {}

      // Категорія
      if (query.category) {
        newFilters.category = parseInt(query.category)
      }

      // Пошук
      if (query.search) {
        newFilters.search = query.search
      }

      // Рівень
      if (query.level) {
        newFilters.level = parseInt(query.level)
      }

      // Інструктор
      if (query.instructor) {
        newFilters.instructor = parseInt(query.instructor)
      }

      // Мова
      if (query.language) {
        newFilters.language = query.language
      }

      // Сортування
      if (query.sort) {
        newFilters.sortBy = query.sort
      }

      // Ціна
      if (query.price_min || query.price_max) {
        newFilters.priceRange = [
          query.price_min ? parseInt(query.price_min) : 0,
          query.price_max ? parseInt(query.price_max) : 5000,
        ]
      }

      this.filters = newFilters
    },

    handleFiltersUpdate(newFilters) {
      this.filters = { ...newFilters }

      // Оновлюємо URL query параметри
      this.updateUrlQuery(newFilters)
    },

    updateUrlQuery(filters) {
      const query = {}

      // Категорія
      if (filters.category) {
        query.category = filters.category
      }

      // Пошук
      if (filters.search) {
        query.search = filters.search
      }

      // Рівень
      if (filters.level) {
        query.level = filters.level
      }

      // Інструктор
      if (filters.instructor) {
        query.instructor = filters.instructor
      }

      // Мова
      if (filters.language) {
        query.language = filters.language
      }

      // Сортування (тільки якщо не за замовчуванням)
      if (filters.sortBy && filters.sortBy !== 'popular') {
        query.sort = filters.sortBy
      }

      // Ціна (тільки якщо змінена)
      if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000)) {
        if (filters.priceRange[0] > 0) {
          query.price_min = filters.priceRange[0]
        }
        if (filters.priceRange[1] < 5000) {
          query.price_max = filters.priceRange[1]
        }
      }

      // Оновлюємо URL без перезавантаження сторінки
      this.$router.replace({
        path: this.$route.path,
        query: Object.keys(query).length > 0 ? query : undefined,
      })
    },

    handleCourseAddedToCart(course) {
      this.showMessage({
        type: 'success',
        text: `Курс "${course.title}" додано до корзини`,
      })

      // Тут можна додати логіку оновлення корзини
      console.log('Курс додано до корзини:', course)
    },

    showMessage(message) {
      this.snackbar = {
        show: true,
        message: message.text,
        color: message.type === 'error' ? 'error' : 'success',
        timeout: 4000,
      }
    },
  },
}
</script>

<style scoped>
.courses-page {
  min-height: calc(100vh - 140px);
  background-color: var(--background-color);
}

/* Заголовок сторінки */
.page-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  color: var(--white);
  padding: 2rem 0 3rem 0;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: var(--background-color);
  clip-path: ellipse(100% 100% at 50% 100%);
}

.header-content {
  position: relative;
  z-index: 2;
}

.breadcrumbs {
  margin-bottom: 1rem;
}

:deep(.v-breadcrumbs) {
  padding: 0;
}

:deep(.v-breadcrumbs-item) {
  color: rgba(255, 255, 255, 0.8);
  font-family: 'VinnytsiaSansReg', sans-serif;
}

:deep(.v-breadcrumbs-item:not(.v-breadcrumbs-item--disabled)) {
  color: var(--white);
}

.page-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.page-description {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
  max-width: 600px;
}

/* Основний контент */
.page-content {
  padding: 3rem 0;
  position: relative;
  z-index: 1;
}

.content-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.filters-sidebar {
  position: sticky;
  top: 120px;
}

.main-content {
  min-height: 500px;
}

/* Responsive стилі */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 0 2rem 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-content {
    padding: 2rem 0;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filters-sidebar {
    position: static;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-description {
    font-size: 1rem;
  }
}

/* Декоративні елементи */
.page-header {
  overflow: hidden;
}

.page-header::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 40%;
  height: 200%;
  background: rgba(255, 255, 255, 0.05);
  transform: rotate(15deg);
  border-radius: 50px;
}
</style>
