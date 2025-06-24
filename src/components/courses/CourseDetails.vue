<template>
  <div class="course-details-page-bg">
    <nav class="breadcrumbs">
      <router-link to="/" class="previous">Головна</router-link>
      <span>/</span>
      <router-link to="/courses" class="previous">Курси</router-link>
      <span>/</span>
      <span class="current">{{ course.title || 'Курс' }}</span>
    </nav>
    <section class="main-section">
      <div class="main-section__content">
        <div class="main-section__info">
          <div class="course-categories">
            <span
              v-for="cat in getCategories(course)"
              :key="cat.id"
              :class="['category-badge', cat.colorClass]"
              >{{ cat.name }}</span
            >
          </div>
          <h1 class="course-title-main">{{ course.title }}</h1>
          <div class="course-meta-list">
            <div class="meta-item">
              <i class="mdi mdi-account-circle"></i> {{ course.instructor?.name || 'Автор Автор' }}
            </div>
            <div class="meta-item">
              <i class="mdi mdi-view-module"></i> {{ course.modules?.length || 0 }} модулів
            </div>
            <div class="meta-item">
              <i class="mdi mdi-book-open-page-variant"></i> {{ course.lessons_count || 0 }} уроків
            </div>
          </div>
          <div class="main-section__price-btn-row">
            <div class="price-row">
              <span
                v-if="course.is_on_discount && course.price !== course.current_price"
                class="old-price"
                >{{ formatPrice(course.price) }} ₴</span
              >
              <span class="main-price"
                >{{ formatPrice(course.current_price || course.price) }} ₴</span
              >
            </div>
            <button class="buy-btn" @click="buyCourse">Придбати курс</button>
          </div>
        </div>
        <div class="main-section__cover main-section__cover--photo">
          <img
            :src="getImageUrl(course.cover_image)"
            :alt="course.title"
            class="main-section__cover-img--full"
          />
          <div class="cover-rating-stars">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= Math.round(course.average_rating) }"
              >★</span
            >
          </div>
          <div class="cover-students-count">
            <i class="mdi mdi-account-group"></i> {{ course.enrollments_count || 0 }} студентів
          </div>
        </div>
      </div>
    </section>

    <!-- Другий grid: promo video + Чому ви навчитесь -->
    <div class="second-grid">
      <div class="promo-video-card" v-if="course.promo_video_url">
        <iframe
          :src="getEmbedVideoUrl(course.promo_video_url)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
      <div class="learn-card">
        <h2>Чому ви навчитесь?</h2>
        <div class="learn-list-modern">
          <div
            v-for="(item, idx) in parseWhatYouLearn(course.what_you_learn)"
            :key="idx"
            class="learn-item"
          >
            <span class="learn-icon"><i class="mdi mdi-check-circle"></i></span>
            <span class="learn-text">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Третій grid: програма курсу + статистика -->
    <div class="third-grid">
      <div class="program-block">
        <h2>Програма курсу</h2>
        <div v-if="course.modules && course.modules.length">
          <div v-for="module in course.modules" :key="module.id" class="module-card">
            <i class="mdi mdi-view-module module-icon"></i>
            <span class="module-title">{{ module.title }}</span>
            <span class="module-lessons-count">{{ module.lessons.length }} уроків</span>
          </div>
        </div>
        <div v-else class="empty-block">Цей курс містить 0 модулів та 0 уроків.</div>
      </div>
      <div class="stats-block">
        <div class="stat-grid">
          <div class="stat-square">
            <div class="stat-value">{{ course.modules?.length || 0 }}</div>
            <div class="stat-label">модулів</div>
          </div>
          <div class="stat-square">
            <div class="stat-value">{{ course.lessons_count || 0 }}</div>
            <div class="stat-label">уроків</div>
          </div>
          <div class="stat-square">
            <div class="stat-value">{{ course.enrollments_count || 0 }}</div>
            <div class="stat-label">студентів</div>
          </div>
          <div class="stat-square">
            <div class="stat-value">{{ formatRating(course.average_rating) }}</div>
            <div class="stat-label">рейтинг</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Відгуки -->
    <section class="reviews-section">
      <h2>Відгуки</h2>
      <div class="review-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-avatar">{{ getInitials(review.user) }}</div>
          <div class="review-content">
            <div class="review-header">
              <span class="review-author">{{ review.user }}</span>
              <span class="review-rating">
                <i
                  v-for="n in 5"
                  :key="n"
                  class="mdi"
                  :class="n <= review.rating ? 'mdi-star' : 'mdi-star-outline'"
                ></i>
              </span>
            </div>
            <div class="review-text">{{ review.content }}</div>
          </div>
        </div>
        <div class="review-card add-review">
          <div class="review-avatar">ПП</div>
          <div class="review-content">
            <div class="review-header">
              <span class="review-author">Напиши свій відгук</span>
              <span class="review-rating">
                <i v-for="n in 5" :key="n" class="mdi mdi-star-outline"></i>
              </span>
            </div>
            <textarea class="review-input" placeholder="Напиши свій відгук"></textarea>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { coursesApi, getImageUrl } from '@/services/api'
import { getImageUrl as oldGetImageUrl } from '@/services/api.js'
// Імпортуємо placeholder зображення
import coursePlaceholder from '@/assets/img/course-placeholder.jpg'

export default {
  name: 'CourseDetails',
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      course: {},
      reviews: [
        // Мокові відгуки для прикладу
        {
          id: 1,
          user: 'Петро Петренко',
          rating: 5,
          content:
            'Будучи студентом цього веб-сайту онлайн-освіти, я можу впевнено сказати, що це був неймовірний досвід. Платформа зручна для користувачів, а курси добре структуровані, що полегшує мені навчання у власному темпі.',
        },
        {
          id: 2,
          user: 'Петро Петренко',
          rating: 5,
          content:
            'Будучи студентом цього веб-сайту онлайн-освіти, я можу впевнено сказати, що це був неймовірний досвід. Платформа зручна для користувачів, а курси добре структуровані, що полегшує мені навчання у власному темпі.',
        },
      ],
      loading: true,
      isInWishlist: false,
    }
  },
  async mounted() {
    await this.loadCourseDetails()
  },
  methods: {
    getImageUrl,
    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },
    formatRating(rating) {
      if (!rating) return '5.0'
      return parseFloat(rating).toFixed(1)
    },
    parseWhatYouLearn(text) {
      if (!text) return []
      return text.split('\n').filter((line) => line.trim())
    },
    getEmbedVideoUrl(url) {
      if (!url) return ''
      // YouTube URL conversion
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = this.extractYouTubeId(url)
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`
        }
      }
      return url
    },
    extractYouTubeId(url) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
      return match ? match[1] : null
    },
    toggleWishlist() {
      this.isInWishlist = !this.isInWishlist
    },
    getInitials(name) {
      if (!name) return '??'
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    getCategories(course) {
      // Повертає масив категорій з кольоровими класами для бейджів
      if (!course.categories && course.category) {
        // Якщо одна категорія
        return [
          { id: course.category.id, name: course.category.name, colorClass: 'category-badge--red' },
        ]
      }
      if (course.categories) {
        // Якщо масив категорій
        return course.categories.map((cat, idx) => ({
          ...cat,
          colorClass: idx === 0 ? 'category-badge--red' : 'category-badge--blue',
        }))
      }
      return []
    },
    async loadCourseDetails() {
      this.loading = true
      try {
        const response = await coursesApi.getCourseById(this.id)
        this.course = response.data?.course || response.data?.data || response.data || {}
      } catch (error) {
        console.error('Помилка завантаження деталей курсу:', error)
      } finally {
        this.loading = false
      }
    },
    buyCourse() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$router.push('/login')
        return
      }
      this.$router.push(`/payment/${this.course.id}`)
    },
  },
}
</script>

<style scoped>
.course-details-page-bg {
  min-height: 100vh;
  background: #f4f5ff;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding-top: 0;
  padding-bottom: 0;
}
.breadcrumbs {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 1150px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
.breadcrumbs .current {
  color: #4f46e5;
  font-weight: bold;
}
.breadcrumbs .previous {
  color: #888;
  text-decoration: none;
}
.main-section {
  background: #f6f7ff;
  border-radius: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  max-width: 1150px;
  margin: 0 auto 2.5rem auto;
  padding: 0 0 0 2.5rem;
  display: flex;
  flex-direction: column;
}
.main-section__content {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: stretch;
  min-height: 280px;
  gap: 0;
}
.main-section__info {
  padding: 2.2rem 1.2rem 2.2rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.main-section__cover.main-section__cover--photo {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  overflow: hidden;
  min-height: 280px;
  background: none;
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
.main-section__cover-img--full {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  background: transparent;
  box-shadow: none;
  display: block;
  margin: 0;
  padding: 0;
}
.cover-rating-stars {
  position: absolute;
  top: 18px;
  right: 16px;
  display: flex;
  gap: 0.2rem;
  font-size: 1.5rem;
  color: #ffee00;
  z-index: 2;
  background: rgba(255, 255, 255, 0);
}
.cover-rating-stars .star {
  color: #ffee00;
  font-size: 1.5rem;
  opacity: 1;
}
.cover-rating-stars .star.filled {
  opacity: 1;
}
.cover-students-count {
  position: absolute;
  bottom: 18px;
  right: 16px;
  color: #ffffff;
  padding: 0.3rem 1.1rem;
  font-size: 1.1rem;
  font-weight: 200;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  z-index: 2;
}
.category-badge {
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.3rem 1.2rem;
  margin-right: 0.7rem;
  margin-bottom: 0.2rem;
  display: inline-block;
}
.category-badge--red {
  background: #f87171;
  color: #fff;
}
.category-badge--blue {
  background: #60a5fa;
  color: #fff;
}
.course-title-main {
  font-size: 2.2rem;
  font-weight: bold;
  color: #4338ca;
  margin-bottom: 1.2rem;
  margin-top: 0.5rem;
}
.course-meta-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 1.15rem;
  color: #222;
  margin-bottom: 1.2rem;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.main-section__price-btn-row {
  display: flex;
  align-items: center;
  gap: 2.2rem;
  margin-top: 1.5rem;
}
.price-row {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}
.old-price {
  text-decoration: line-through;
  color: #aaa;
  font-size: 1.1rem;
  font-weight: 500;
}
.main-price {
  color: #16a34a;
  font-size: 2.1rem;
  font-weight: bold;
}
.buy-btn {
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 1.1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
}
@media (max-width: 1200px) {
  .main-section,
  .breadcrumbs {
    max-width: 100%;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
@media (max-width: 900px) {
  .main-section {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .breadcrumbs {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
@media (max-width: 700px) {
  .main-section {
    border-radius: 0;
    margin: 0;
    padding-left: 0.2rem;
    padding-right: 0.2rem;
  }
  .main-section__info {
    padding: 1.2rem 0.5rem;
  }
  .main-section__cover-img--full {
    width: 100%;
    max-height: 120px;
  }
  .buy-btn {
    padding: 0.7rem 1.2rem;
    font-size: 1rem;
  }
}
.second-grid {
  max-width: 1225px;
  margin: 0 auto 2rem auto;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
}
.promo-video-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  width: 100%;
  height: 100%;
}
.promo-video-card iframe {
  width: 100%;
  height: 100%;
  min-height: 220px;
  aspect-ratio: 16/9;
  border-radius: 18px;
  border: none;
  background: #000;
  box-shadow: none;
  display: block;
}
.learn-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 1.2rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.learn-card h2 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
.learn-list-modern {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.learn-item {
  display: flex;
  align-items: center;
  background: #f4f5ff;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  font-size: 1.08rem;
  font-weight: 500;
  color: #222;
  box-shadow: 0 1px 4px rgba(79, 70, 229, 0.04);
}
.learn-icon {
  color: #2563eb;
  font-size: 1.4rem;
  margin-right: 1rem;
  flex-shrink: 0;
}
.learn-text {
  flex: 1;
}
.third-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  max-width: 1150px;
  margin: 0 auto 2rem auto;
}
.program-block {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 1.2rem 2rem;
}
.program-block h2 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}
.module-card {
  background: #f0f6ff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(79, 70, 229, 0.06);
  margin-bottom: 1.1rem;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 1.1rem;
  font-weight: 600;
}
.module-icon {
  color: #4f46e5;
  font-size: 1.5rem;
}
.module-title {
  flex: 1;
}
.module-lessons-count {
  color: #2563eb;
  font-size: 1rem;
  font-weight: 500;
}
.stats-block {
  background: #4f46e5;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
}
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  width: 100%;
  height: 100%;
}
.stat-square {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.1rem;
  font-weight: bold;
  border-right: 1px solid #6366f1;
  border-bottom: 1px solid #6366f1;
  padding: 2.2rem 0;
}
.stat-square:nth-child(2n) {
  border-right: none;
}
.stat-square:nth-child(n + 3) {
  border-bottom: none;
}
.stat-label {
  font-size: 1.1rem;
  font-weight: 400;
  margin-top: 0.5rem;
}
.reviews-section {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  max-width: 1150px;
  margin: 0 auto 2rem auto;
}
.reviews-section h2 {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
}
.review-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.review-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  box-shadow: 0 1px 4px rgba(79, 70, 229, 0.04);
}
.review-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #3730a3;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.review-content {
  flex: 1;
}
.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.review-author {
  font-weight: 600;
  color: #222;
}
.review-rating .mdi {
  color: #fbbf24;
  font-size: 1.2rem;
}
.review-text {
  font-size: 1.05rem;
  color: #333;
}
.add-review {
  background: #f6f7ff;
  border-style: dashed;
}
.review-input {
  width: 100%;
  min-height: 38px;
  border: none;
  background: transparent;
  font-size: 1.05rem;
  color: #222;
  margin-top: 0.5rem;
  outline: none;
  resize: none;
}
@media (max-width: 1200px) {
  .second-grid {
    max-width: 100%;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}
@media (max-width: 900px) {
  .second-grid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .promo-video-card {
    min-height: 180px;
    padding: 0;
  }
}
@media (max-width: 700px) {
  .second-grid {
    padding-left: 0.2rem;
    padding-right: 0.2rem;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .promo-video-card {
    min-height: 120px;
    padding: 0;
  }
  .promo-video-card iframe {
    min-height: 120px;
    border-radius: 12px;
  }
}
</style>
