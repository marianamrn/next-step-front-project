<template>
  <section class="most-popular-courses">
    <div class="container">
      <!-- Заголовок секції -->
      <div class="section-header">
        <p class="section-subtitle">ВАЖЛИВИЙ ДОСВІД</p>
        <h2 class="section-title">Наші найпопулярніші курси</h2>
      </div>

      <!-- Категорії курсів (горизонтальний скрол) -->
      <div class="categories-tabs">
        <div class="categories-scroll" ref="categoriesScroll">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="['category-tab', { active: selectedCategory === category.id }]"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Кнопки скролу категорій -->
        <button
          class="scroll-btn scroll-left"
          @click="scrollCategories('left')"
          v-if="canScrollLeft"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </button>
        <button
          class="scroll-btn scroll-right"
          @click="scrollCategories('right')"
          v-if="canScrollRight"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </button>
      </div>

      <!-- Інформація про обрану категорію -->
      <div class="category-info" v-if="selectedCategoryData">
        <div class="category-card">
          <h3 class="category-name">{{ selectedCategoryData.name }}</h3>
          <p class="courses-count">{{ filteredCourses.length }} курсів</p>
        </div>
      </div>

      <!-- Курси -->
      <div v-if="loadingCourses" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="50" />
        <p>Завантажуємо курси...</p>
      </div>

      <div v-else-if="allCourses.length === 0" class="empty-state">
        <v-icon size="64" color="#ccc">mdi-book-open-outline</v-icon>
        <h3>Курси не знайдено</h3>
        <p>На даний момент немає доступних курсів</p>
        <v-btn variant="outlined" color="primary" @click="loadCourses"> Оновити </v-btn>
      </div>

      <div v-else class="courses-section">
        <div class="courses-container">
          <div class="courses-scroll" ref="coursesScroll">
            <div
              v-for="course in displayedCourses"
              :key="course.id"
              class="course-card"
              @click="goToCourse(course)"
            >
              <!-- Банер курсу -->
              <div class="course-banner">
                <img
                  :src="getCourseImage(course)"
                  :alt="course.title"
                  class="course-image"
                  @error="onImageError"
                />
                <div class="course-rating">
                  <v-icon size="14" color="#FFD700">mdi-star</v-icon>
                  <span>{{ course.rating || '4.6' }}</span>
                </div>
              </div>

              <!-- Інформація про курс -->
              <div class="course-content">
                <div class="course-category">
                  {{ course.category ? course.category.name : getCategoryName(course.category_id) }}
                </div>

                <h3 class="course-title">{{ course.title }}</h3>

                <div class="course-stats">
                  <div class="stat-item">
                    <v-icon size="16" color="#666">mdi-play-circle</v-icon>
                    <span>{{ course.lessons_count || '24' }} Уроків</span>
                  </div>
                  <div class="stat-item">
                    <v-icon size="16" color="#666">mdi-account-group</v-icon>
                    <span>{{ course.students_count || '239' }} Студентів</span>
                  </div>
                </div>

                <div class="course-footer">
                  <div class="course-price">
                    <span
                      v-if="course.is_on_discount && course.price !== course.current_price"
                      class="original-price"
                    >
                      {{ parseFloat(course.price).toFixed(2) }} ₴
                    </span>
                    <span class="current-price">{{ formatPrice(course) }} ₴</span>
                  </div>
                  <button class="add-to-cart-btn" @click.stop="addToCart(course)">
                    <v-icon size="20" color="white">mdi-cart</v-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки скролу курсів -->
          <button
            class="courses-scroll-btn courses-scroll-left"
            @click="scrollCourses('left')"
            v-if="canScrollCoursesLeft"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </button>
          <button
            class="courses-scroll-btn courses-scroll-right"
            @click="scrollCourses('right')"
            v-if="canScrollCoursesRight"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </button>
        </div>

        <!-- Кнопка показати всі курси -->
        <div class="show-all-section">
          <v-btn variant="outlined" color="primary" class="show-all-btn" @click="showAllCourses">
            Показати всі курси :
            {{ selectedCategoryData ? selectedCategoryData.name : 'Всі категорії' }}
          </v-btn>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { categoriesApi, coursesApi } from '@/services/api'
import { getImageUrl } from '@/services/api.js'
// Імпортуємо placeholder зображення
import coursePlaceholder from '@/assets/img/course-placeholder.jpg'

export default {
  name: 'MostPopularCourses',
  data() {
    return {
      categories: [],
      allCourses: [],
      selectedCategory: null,
      loadingCourses: true,
      canScrollLeft: false,
      canScrollRight: false,
      canScrollCoursesLeft: false,
      canScrollCoursesRight: false,
    }
  },
  computed: {
    selectedCategoryData() {
      return this.categories.find((cat) => cat.id === this.selectedCategory)
    },
    filteredCourses() {
      console.log('Фільтрація курсів для категорії:', this.selectedCategory)
      console.log('Всі курси:', this.allCourses)

      if (!this.selectedCategory || this.selectedCategory === 'all') {
        console.log('Показуємо всі курси')
        return this.allCourses
      }

      const filtered = this.allCourses.filter((course) => {
        // Підтримуємо різні формати category_id
        const courseCategory = course.category_id || (course.category && course.category.id)
        const matches = courseCategory == this.selectedCategory

        if (!matches) {
          console.log(
            `Курс "${course.title}" не відповідає категорії. Курс: ${courseCategory}, Обрана: ${this.selectedCategory}`,
          )
        }

        return matches
      })

      console.log('Відфільтровані курси:', filtered)
      return filtered
    },
    displayedCourses() {
      return this.filteredCourses.slice(0, 12)
    },
  },
  mounted() {
    this.loadCategories()
    this.loadCourses()
    this.updateScrollButtons()
    this.updateCoursesScrollButtons()
  },
  methods: {
    async loadCategories() {
      try {
        console.log('Запит до API getAllCategories...')
        const response = await categoriesApi.getAllCategories()
        console.log('Відповідь категорій:', response)

        let categoriesData = []

        if (response.data) {
          if (response.data.success && response.data.data) {
            categoriesData = response.data.data
          } else if (Array.isArray(response.data)) {
            categoriesData = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            categoriesData = response.data.data
          }
        }

        console.log('Отримані категорії:', categoriesData)

        // Додаємо категорію "Всі"
        this.categories = [
          { id: 'all', name: 'Всі' },
          ...categoriesData.filter((cat) => cat.status !== 'inactive'),
        ]

        console.log('Фінальні категорії:', this.categories)

        // Вибираємо першу категорію за замовчуванням
        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0].id
          console.log('Обрана категорія:', this.selectedCategory)
        }
      } catch (error) {
        console.error('Помилка завантаження категорій:', error)
        console.error('Деталі помилки категорій:', error.response)
        this.categories = [{ id: 'all', name: 'Всі' }]
        this.selectedCategory = 'all'
      }
    },

    async loadCourses() {
      this.loadingCourses = true
      try {
        console.log('Запит до API getAllCourses...')
        const response = await coursesApi.getAllCourses(1, 50)
        console.log('Повна відповідь API:', response)

        // Детальне логування структури відповіді
        if (response.data) {
          console.log('response.data:', response.data)
          console.log('response.data.success:', response.data.success)
          console.log('response.data.data:', response.data.data)
        }

        let coursesData = []

        // Обробляємо різні можливі структури відповіді
        if (response.data && response.data.success && response.data.data) {
          // Структура: { success: true, data: [...] }
          coursesData = response.data.data
          console.log('Використовуємо response.data.data')
        } else if (response.data && Array.isArray(response.data.data)) {
          // Альтернативна структура з data масивом
          coursesData = response.data.data
          console.log('Використовуємо response.data.data (масив)')
        } else if (response.data && Array.isArray(response.data)) {
          // Пряма структура з масивом в data
          coursesData = response.data
          console.log('Використовуємо response.data (прямий масив)')
        } else if (Array.isArray(response)) {
          // Відповідь це прямий масив
          coursesData = response
          console.log('Використовуємо response (прямий масив)')
        }

        console.log('Отримані курси (до фільтрації):', coursesData)
        console.log('Кількість курсів до фільтрації:', coursesData.length)

        // Фільтруємо тільки опубліковані курси з детальним логуванням
        this.allCourses = coursesData.filter((course) => {
          const isPublished = course.is_published === true
          if (!isPublished) {
            console.log('Курс не опублікований:', course.title, {
              is_published: course.is_published,
            })
          }
          return isPublished
        })

        console.log('Опубліковані курси:', this.allCourses)
        console.log('Завантажено опублікованих курсів:', this.allCourses.length)

        // Якщо немає опублікованих курсів, показуємо всі для тестування
        if (this.allCourses.length === 0 && coursesData.length > 0) {
          console.warn('Немає опублікованих курсів. Показуємо всі для тестування.')
          this.allCourses = coursesData
        }
      } catch (error) {
        console.error('Помилка завантаження курсів:', error)
        console.error('Деталі помилки:', error.response)
        this.allCourses = []
      } finally {
        this.loadingCourses = false
      }
    },

    selectCategory(categoryId) {
      this.selectedCategory = categoryId
    },

    getCategoryName(categoryId) {
      const category = this.categories.find((cat) => cat.id == categoryId)
      return category ? category.name : 'Загальна категорія'
    },

    getCourseImage(course) {
      // Використовуємо cover_image з API відповіді
      if (course && course.cover_image) {
        return getImageUrl(course.cover_image)
      }

      // Fallback на імпортований placeholder
      return coursePlaceholder
    },

    onImageError(event) {
      // При помилці завантаження зображення показуємо placeholder
      event.target.src = coursePlaceholder
    },

    formatPrice(course) {
      if (!course) return '200.00'

      // Використовуємо current_price якщо є, інакше price
      const price = course.current_price || course.price || course.discount_price
      if (!price) return '200.00'

      return parseFloat(price).toFixed(2)
    },

    addToCart(course) {
      console.log('Додати до корзини:', course.title)
      // Логіка додавання до корзини
    },

    goToCourse(course) {
      this.$router.push(`/courses/${course.id}`)
    },

    showAllCourses() {
      if (this.selectedCategory && this.selectedCategory !== 'all') {
        this.$router.push({
          path: '/courses',
          query: { category: this.selectedCategory },
        })
      } else {
        this.$router.push('/courses')
      }
    },

    scrollCategories(direction) {
      const container = this.$refs.categoriesScroll
      const scrollAmount = 200

      if (direction === 'left') {
        container.scrollLeft -= scrollAmount
      } else {
        container.scrollLeft += scrollAmount
      }

      this.$nextTick(() => {
        this.updateScrollButtons()
      })
    },

    scrollCourses(direction) {
      const container = this.$refs.coursesScroll
      const scrollAmount = 320

      if (direction === 'left') {
        container.scrollLeft -= scrollAmount
      } else {
        container.scrollLeft += scrollAmount
      }

      this.$nextTick(() => {
        this.updateCoursesScrollButtons()
      })
    },

    updateScrollButtons() {
      const container = this.$refs.categoriesScroll
      if (container) {
        this.canScrollLeft = container.scrollLeft > 0
        this.canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth
      }
    },

    updateCoursesScrollButtons() {
      const container = this.$refs.coursesScroll
      if (container) {
        this.canScrollCoursesLeft = container.scrollLeft > 0
        this.canScrollCoursesRight =
          container.scrollLeft < container.scrollWidth - container.clientWidth
      }
    },
  },

  watch: {
    selectedCategory() {
      this.$nextTick(() => {
        this.updateCoursesScrollButtons()
      })
    },
  },
}
</script>

<style scoped>
.most-popular-courses {
  background-color: var(--white);
  padding: 5rem 0;
  position: relative;
}

/* Заголовок секції */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
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

/* Категорії (таби) */
.categories-tabs {
  position: relative;
  margin-bottom: 2rem;
}

.categories-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.category-tab {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--border-color);
  background-color: var(--white);
  border-radius: 8px;
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.category-tab.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
  position: relative;
}

.category-tab.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background-color: var(--primary-color);
}

/* Кнопки скролу категорій */
.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.scroll-btn:hover {
  background-color: var(--primary-color);
  color: var(--white);
}

.scroll-left {
  left: -20px;
}

.scroll-right {
  right: -20px;
}

/* Інформація про категорію */
.category-info {
  margin-bottom: 2rem;
}

.category-card {
  background-color: var(--light-gray);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: inline-block;
}

.category-name {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.25rem;
  color: var(--text-color);
  margin: 0 0 0.25rem 0;
}

.courses-count {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
  margin: 0;
}

/* Стани завантаження та помилок */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.loading-state p,
.error-state p,
.empty-state p {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1.1rem;
  color: var(--secondary-text-color);
  margin-top: 1rem;
}

.empty-state h3 {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.5rem;
  color: var(--text-color);
  margin: 1rem 0 0.5rem 0;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

.error-state p {
  margin-bottom: 1.5rem;
}

/* Секція курсів */
.courses-section {
  position: relative;
}

.courses-container {
  position: relative;
}

.courses-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
}

.courses-scroll::-webkit-scrollbar {
  display: none;
}

/* Картка курсу */
.course-card {
  flex-shrink: 0;
  width: 280px;
  background-color: var(--white);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Банер курсу */
.course-banner {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border-radius: 16px;
  margin: 16px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.course-rating {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--text-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Контент курсу */
.course-content {
  padding: 0 20px 20px 20px;
}

.course-category {
  display: inline-block;
  background-color: #a855f7;
  color: var(--white);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 12px;
  font-family: 'VinnytsiaSansBold', sans-serif;
}

.course-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  margin: 0 0 16px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.original-price {
  font-size: 0.85rem;
  color: var(--secondary-text-color);
  text-decoration: line-through;
  margin-bottom: 4px;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.current-price {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--text-color);
}

.add-to-cart-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.add-to-cart-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
}

/* Кнопки скролу курсів */
.courses-scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.courses-scroll-btn:hover {
  background-color: var(--primary-color);
  color: var(--white);
}

.courses-scroll-left {
  left: -25px;
}

.courses-scroll-right {
  right: -25px;
}

/* Секція "Показати всі" */
.show-all-section {
  text-align: center;
  margin-top: 3rem;
}

.show-all-btn {
  font-family: 'VinnytsiaSansBold', sans-serif;
  text-transform: none;
  letter-spacing: 0;
  padding: 0 2rem;
  height: 50px;
}

/* Responsive стилі */
@media (max-width: 1024px) {
  .section-title {
    font-size: 2.2rem;
  }

  .course-card {
    width: 260px;
  }

  .courses-scroll {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .most-popular-courses {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .course-card {
    width: 240px;
  }

  .courses-scroll-btn {
    display: none;
  }

  .scroll-btn {
    display: none;
  }
}

@media (max-width: 480px) {
  .course-card {
    width: 220px;
  }

  .courses-scroll {
    gap: 0.8rem;
  }

  .category-tab {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
