<template>
  <div class="course-card" @click="goToCourse">
    <!-- Банер курсу -->
    <div class="course-banner">
      <img
        :src="getCourseImage(course)"
        :alt="course.title"
        class="course-image"
        @error="onImageError"
      />
      <div class="course-overlay">
        <div class="course-rating" v-if="course.rating || course.average_rating">
          <v-icon size="14" color="#FFD700">mdi-star</v-icon>
          <span>{{ formatRating(course.rating ?? course.average_rating) }}</span>
        </div>
        <div class="course-level" v-if="course.level">
          <v-chip size="small" :color="getLevelColor(course.level.code)">
            {{ course.level.name }}
          </v-chip>
        </div>
      </div>
      <div class="course-favorite-btn">
        <v-btn
          icon
          variant="flat"
          size="small"
          :color="isFavorite ? 'red' : 'white'"
          @click.stop="toggleFavorite"
        >
          <v-icon :color="isFavorite ? 'white' : 'grey'">
            {{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Контент курсу -->
    <div class="course-content">
      <!-- Категорія курсу -->
      <div class="course-category" v-if="course.category">
        <v-chip size="small" variant="flat" color="primary">
          {{ course.category.name }}
        </v-chip>
      </div>

      <!-- Заголовок курсу -->
      <h3 class="course-title">{{ course.title }}</h3>

      <!-- Опис курсу -->
      <p class="course-description" v-if="course.description">
        {{ truncateDescription(course.description) }}
      </p>

      <!-- Інструктор -->
      <div class="course-instructor" v-if="course.instructor">
        <div class="instructor-info">
          <v-icon size="16" color="#666">mdi-account-circle</v-icon>
          <span>{{ course.instructor.full_name || course.instructor.name }}</span>
        </div>
      </div>

      <!-- Статистика курсу -->
      <div class="course-stats">
        <div class="stat-item">
          <v-icon size="16" color="#666">mdi-play-circle</v-icon>
          <span>{{ lessonsCount }} уроків</span>
        </div>
        <div class="stat-item">
          <v-icon size="16" color="#666">mdi-account-group</v-icon>
          <span>{{ course.students_count ?? course.enrollments_count ?? '0' }} студентів</span>
        </div>
        <div class="stat-item" v-if="course.duration">
          <v-icon size="16" color="#666">mdi-clock-outline</v-icon>
          <span>{{ formatDuration(course.duration) }}</span>
        </div>
      </div>

      <!-- Ціна та кнопка -->
      <div class="course-footer">
        <div class="course-price">
          <span
            v-if="course.is_on_discount && course.price !== course.current_price"
            class="original-price"
          >
            {{ formatPrice(course.price) }} ₴
          </span>
          <span class="current-price">
            {{ formatPrice(course.current_price || course.discount_price || course.price) }} ₴
          </span>
          <v-chip
            v-if="course.is_on_discount"
            size="x-small"
            color="error"
            variant="flat"
            class="discount-badge"
          >
            Знижка!
          </v-chip>
        </div>

        <v-btn
          variant="flat"
          color="primary"
          size="small"
          prepend-icon="mdi-cart-plus"
          @click.stop="addToCart"
          :loading="addingToCart"
        >
          В корзину
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
// Імпортуємо placeholder зображення
import coursePlaceholder from '@/assets/img/course-placeholder.jpg'
import { getLessonsCount } from '@/utils/lessonUtils.js'
import { getImageUrl } from '@/services/api.js'

export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isFavorite: false,
      addingToCart: false,
    }
  },
  computed: {
    lessonsCount() {
      return getLessonsCount(this.course)
    },
  },
  methods: {
    goToCourse() {
      this.$router.push(`/courses/${this.course.id}`)
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

    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },

    formatRating(rating) {
      return parseFloat(rating).toFixed(1)
    },

    getLevelColor(levelCode) {
      const colors = {
        beginner: 'success',
        intermediate: 'warning',
        advanced: 'error',
      }
      return colors[levelCode] || 'primary'
    },

    truncateDescription(description) {
      if (!description) return ''
      return description.length > 120 ? description.substring(0, 120) + '...' : description
    },

    formatDuration(duration) {
      // Припускаємо, що duration в хвилинах
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60

      if (hours > 0) {
        return `${hours}г ${minutes}хв`
      }
      return `${minutes}хв`
    },

    async toggleFavorite() {
      this.isFavorite = !this.isFavorite
      // Тут буде логіка додавання/видалення з улюблених
      console.log('Toggle favorite for course:', this.course.id)
    },

    async addToCart() {
      this.addingToCart = true
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }
        // Перенаправлення на оплату
        this.$router.push(`/payment/${this.course.id}`)
      } catch (error) {
        console.error('Error redirecting to payment:', error)
      } finally {
        this.addingToCart = false
      }
    },
  },
}
</script>

<style scoped>
.course-card {
  background-color: var(--white);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Банер курсу */
.course-banner {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.course-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.course-rating {
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

.course-level {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.course-favorite-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* Контент курсу */
.course-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-category {
  margin-bottom: 12px;
}

.course-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-description {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
  line-height: 1.5;
  margin-bottom: 12px;
  flex: 1;
}

.course-instructor {
  margin-bottom: 16px;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.course-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--secondary-text-color);
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.course-price {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.original-price {
  font-size: 0.8rem;
  color: var(--secondary-text-color);
  text-decoration: line-through;
  margin-bottom: 2px;
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.current-price {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.4rem;
  font-weight: bold;
  color: var(--text-color);
}

.discount-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.7rem;
}

/* Responsive стилі */
@media (max-width: 768px) {
  .course-banner {
    height: 180px;
  }

  .course-content {
    padding: 16px;
  }

  .course-title {
    font-size: 1.1rem;
  }

  .course-stats {
    gap: 12px;
  }

  .stat-item {
    font-size: 0.8rem;
  }

  .current-price {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .course-banner {
    height: 160px;
  }

  .course-content {
    padding: 12px;
  }

  .course-title {
    font-size: 1rem;
  }

  .course-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
