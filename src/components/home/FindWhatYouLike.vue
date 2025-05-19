<template>
  <section class="find-what-you-like">
    <div class="container">
      <div class="section-header">
        <p class="section-subtitle">НАШІ КУРСИ</p>
        <h2 class="section-title">Знайди що тобі до душі</h2>
      </div>

      <div v-if="loading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="50" />
        <p>Завантажуємо категорії...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <v-icon size="48" color="error">mdi-alert-circle</v-icon>
        <p>Помилка завантаження категорій</p>
        <v-btn @click="loadCategories" color="primary" variant="outlined"> Спробувати знову </v-btn>
      </div>

      <div v-else class="categories-grid">
        <div
          v-for="category in displayedCategories"
          :key="category.id"
          class="category-card"
          @click="goToCourses(category)"
        >
          <div class="category-icon">
            <v-icon size="20" color="white">{{ getCategoryIcon(category.name) }}</v-icon>
          </div>
          <h3 class="category-name">{{ category.name }}</h3>
        </div>
      </div>

      <!-- Fallback якщо API не працює -->
      <div v-if="!loading && !error && categories.length === 0" class="fallback-categories">
        <div class="categories-grid">
          <div
            v-for="category in fallbackCategories"
            :key="category.id"
            class="category-card"
            @click="goToCourses(category)"
          >
            <div class="category-icon">
              <v-icon size="20" color="white">{{ category.icon }}</v-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { categoriesApi } from '@/services/api'

export default {
  name: 'FindWhatYouLike',
  data() {
    return {
      categories: [],
      loading: true,
      error: false,
      // Fallback категорії якщо API не працює
      fallbackCategories: [
        { id: 1, name: 'Тестування ПЗ', icon: 'mdi-bug' },
        { id: 2, name: 'Алгоритми', icon: 'mdi-code-braces' },
        { id: 3, name: 'Backend', icon: 'mdi-server' },
        { id: 4, name: 'Frontend', icon: 'mdi-monitor' },
        { id: 5, name: 'UI/UX Design', icon: 'mdi-palette' },
        { id: 6, name: 'Web Designing', icon: 'mdi-web' },
        { id: 7, name: 'Psychology', icon: 'mdi-brain' },
        { id: 8, name: 'See All', icon: 'mdi-circle' },
      ],
    }
  },
  computed: {
    displayedCategories() {
      // Показуємо максимум 8 категорій
      return this.categories.slice(0, 8)
    },
  },
  mounted() {
    this.loadCategories()
  },
  methods: {
    async loadCategories() {
      this.loading = true
      this.error = false

      try {
        const response = await categoriesApi.getAllCategories()

        // Обробляємо різні структури відповіді
        let categoriesData = []
        if (response.data) {
          // Якщо дані в response.data
          categoriesData = Array.isArray(response.data) ? response.data : response.data.data || []
        } else if (Array.isArray(response)) {
          // Якщо відповідь це масив
          categoriesData = response
        }

        // Фільтруємо тільки активні категорії (якщо є поле status)
        this.categories = categoriesData.filter(
          (category) => !category.status || category.status === 'active' || category.status === 1,
        )

        // Обмежуємо до 7 категорій і додаємо "See All"
        if (this.categories.length > 7) {
          this.categories = this.categories.slice(0, 7)
        }

        // Завжди додаємо "See All" в кінці
        this.categories.push({
          id: 'see-all',
          name: 'See All',
          slug: 'see-all',
        })

        console.log('Завантажено категорій:', this.categories.length)
      } catch (error) {
        console.error('Помилка завантаження категорій:', error)
        this.error = true
        // Використовуємо fallback категорії
        this.categories = []
      } finally {
        this.loading = false
      }
    },
    getCategoryIcon(categoryName) {
      // Мапінг назв категорій до іконок
      const iconMap = {
        тестування: 'mdi-bug',
        test: 'mdi-bug',
        qa: 'mdi-bug',
        алгоритми: 'mdi-code-braces',
        algorithms: 'mdi-code-braces',
        backend: 'mdi-server',
        бекенд: 'mdi-server',
        frontend: 'mdi-monitor',
        фронтенд: 'mdi-monitor',
        design: 'mdi-palette',
        дизайн: 'mdi-palette',
        'ui/ux': 'mdi-palette',
        web: 'mdi-web',
        веб: 'mdi-web',
        psychology: 'mdi-brain',
        психология: 'mdi-brain',
        'see all': 'mdi-circle',
        'всі курси': 'mdi-circle',
        програмування: 'mdi-code-tags',
        programming: 'mdi-code-tags',
        маркетинг: 'mdi-trending-up',
        marketing: 'mdi-trending-up',
        бізнес: 'mdi-briefcase',
        business: 'mdi-briefcase',
        мови: 'mdi-translate',
        languages: 'mdi-translate',
        математика: 'mdi-calculator',
        math: 'mdi-calculator',
        science: 'mdi-flask',
        наука: 'mdi-flask',
        data: 'mdi-chart-line',
        дані: 'mdi-chart-line',
        mobile: 'mdi-cellphone',
        мобільні: 'mdi-cellphone',
        game: 'mdi-gamepad-variant',
        ігри: 'mdi-gamepad-variant',
      }

      if (!categoryName) return 'mdi-school'

      const name = categoryName.toLowerCase()
      for (const [key, icon] of Object.entries(iconMap)) {
        if (name.includes(key)) {
          return icon
        }
      }

      // За замовчуванням
      return 'mdi-school'
    },
    goToCourses(category) {
      // Перенаправляємо на сторінку курсів з параметром категорії
      if (category.id === 'see-all' || category.name === 'See All') {
        this.$router.push('/courses')
      } else {
        this.$router.push({
          path: '/courses',
          query: { category: category.id },
        })
      }
    },
  },
}
</script>

<style scoped>
.find-what-you-like {
  background-color: var(--white);
  padding: 5rem 0;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-subtitle {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--accent-orange);
  letter-spacing: 1px;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.section-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-color);
  margin: 0;
  line-height: 1.2;
}

/* Сітка категорій - 4 в рядок */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

/* Картка категорії - прямокутна, іконка зліва, назва справа */
.category-card {
  background-color: var(--light-gray);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  min-height: 60px;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-3px);
  background-color: var(--white);
  border-color: rgba(68, 59, 201, 0.3);
  box-shadow: 0 4px 15px rgba(68, 59, 201, 0.1);
}

.category-card:hover::before {
  transform: scaleX(1);
}

.category-card:hover .category-icon {
  transform: scale(1.1);
  background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
}

/* Іконка категорії - прямокутна зліва */
.category-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* Назва категорії - справа */
.category-name {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  line-height: 1.2;
  flex: 1;
  transition: color 0.3s ease;
}

.category-card:hover .category-name {
  color: var(--primary-color);
}

/* Стани завантаження та помилок */
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 0;
}

.loading-state p,
.error-state p {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1.1rem;
  color: var(--secondary-text-color);
  margin-top: 1rem;
}

.error-state p {
  margin-bottom: 1.5rem;
}

/* Responsive стилі */
@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
  }

  .section-title {
    font-size: 2.2rem;
  }

  .category-card {
    padding: 0.8rem 1.2rem;
    min-height: 55px;
  }

  .category-icon {
    width: 32px;
    height: 32px;
  }

  .category-name {
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .find-what-you-like {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .category-card {
    padding: 0.8rem 1rem;
    min-height: 50px;
  }

  .category-icon {
    width: 30px;
    height: 30px;
  }

  .category-name {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .category-card {
    padding: 0.8rem;
    min-height: 48px;
  }

  .category-icon {
    width: 28px;
    height: 28px;
  }

  .category-name {
    font-size: 0.85rem;
  }
}
</style>
