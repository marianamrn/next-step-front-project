<template>
  <div class="course-details" v-if="course">
    <div class="course-header">
      <div class="course-cover">
        <img :src="getImageUrl(course.cover_image)" :alt="course.title" />
      </div>
      <div class="course-info">
        <h1 class="course-title">{{ course.title }}</h1>
        <div class="course-meta">
          <span class="category">{{ course.category?.name }}</span>
          <span class="level">{{ course.level?.name }}</span>
        </div>
        <div class="course-price" v-if="course.is_on_discount">
          <span class="original-price">{{ course.price }} ₴</span>
          <span class="discount-price">{{ course.discount_price }} ₴</span>
          <span class="discount-badge">Знижка</span>
        </div>
        <div class="course-price" v-else>
          <span class="price">{{ course.price }} ₴</span>
        </div>
      </div>
    </div>

    <div class="course-content">
      <div class="course-video" v-if="course.promo_video_url">
        <iframe
          :src="course.promo_video_url"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>

      <div class="course-description">
        <h2>Опис курсу</h2>
        <p>{{ course.description }}</p>
      </div>

      <div class="course-requirements" v-if="course.requirements">
        <h2>Вимоги до курсу</h2>
        <p>{{ course.requirements }}</p>
      </div>

      <div class="course-what-you-learn" v-if="course.what_you_learn">
        <h2>Що ви вивчите</h2>
        <p>{{ course.what_you_learn }}</p>
      </div>

      <div class="course-stats">
        <div class="stat-item">
          <i class="mdi mdi-book-open-page-variant"></i>
          <span>{{ totalLessons }} уроків</span>
        </div>
        <div class="stat-item">
          <i class="mdi mdi-clock-outline"></i>
          <span>{{ course.language }}</span>
        </div>
      </div>
    </div>
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
      reviews: [],
      relatedCourses: [],
      loading: true,
      purchaseLoading: false,
      cartLoading: false,
      activeTab: 'overview',
      expandedModules: {},
      showPreviewModal: false,
      isInWishlist: false,
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        timeout: 4000,
      },
      totalLessons: 0,
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
          disabled: false,
        },
      ]

      if (this.course.category) {
        items.push({
          title: this.course.category.name,
          href: `/courses?category=${this.course.category.id}`,
          disabled: false,
        })
      }

      items.push({
        title: this.course.title || 'Курс',
        href: '#',
        disabled: true,
      })

      return items
    },

    modulesSummary() {
      if (!this.course.modules || !this.course.modules.length) {
        return {
          totalLessons: 0,
          totalDuration: '0 хв',
        }
      }

      const totalLessons = this.course.modules.reduce((sum, module) => {
        return sum + (module.lessons_count || 0)
      }, 0)

      const totalMinutes = this.course.modules.reduce((sum, module) => {
        return sum + (module.duration || 0)
      }, 0)

      return {
        totalLessons,
        totalDuration: this.formatDuration(totalMinutes),
      }
    },
  },
  async mounted() {
    await this.loadCourseDetails()
    await this.loadRelatedCourses()
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.loadCourseDetails()
      },
    },
  },
  methods: {
    getImageUrl,
    async loadCourseDetails() {
      this.loading = true
      try {
        const response = await coursesApi.getCourseById(this.id)

        if (response.data?.success && response.data?.data) {
          this.course = response.data.data
        } else if (response.data) {
          this.course = response.data
        }

        // Ініціалізуємо стан розгорнутих модулів
        if (this.course.modules) {
          this.expandedModules = this.course.modules.reduce((acc, module, index) => {
            acc[index] = false
            return acc
          }, {})
        }

        console.log('Завантажено деталі курсу:', this.course)
        this.calculateTotalLessons()
      } catch (error) {
        console.error('Помилка завантаження деталей курсу:', error)
        this.showMessage({
          type: 'error',
          text: 'Помилка завантаження деталей курсу',
        })
      } finally {
        this.loading = false
      }
    },

    async loadRelatedCourses() {
      try {
        if (this.course.category_id) {
          const response = await coursesApi.getCoursesByCategory(this.course.category_id, 1, 5)

          let coursesData = []
          if (response.data?.success && response.data?.data) {
            coursesData = response.data.data
          } else if (response.data && Array.isArray(response.data)) {
            coursesData = response.data
          }

          // Виключаємо поточний курс та показуємо тільки перші 4
          this.relatedCourses = coursesData
            .filter((course) => course.id !== this.course.id)
            .slice(0, 4)
        }
      } catch (error) {
        console.error('Помилка завантаження схожих курсів:', error)
      }
    },

    toggleModule(moduleIndex) {
      this.expandedModules[moduleIndex] = !this.expandedModules[moduleIndex]
    },

    formatPrice(price) {
      if (!price) return '0.00'
      return parseFloat(price).toFixed(2)
    },

    formatRating(rating) {
      if (!rating) return '0.0'
      return parseFloat(rating).toFixed(1)
    },

    formatDuration(minutes) {
      if (!minutes) return '0 хв'

      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60

      if (hours > 0) {
        return `${hours}г ${remainingMinutes}хв`
      }
      return `${minutes}хв`
    },

    formatDate(dateString) {
      if (!dateString) return ''

      const date = new Date(dateString)
      return new Intl.DateTimeFormat('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    },

    calculateDiscount(originalPrice, discountPrice) {
      if (!originalPrice || !discountPrice) return 0
      return Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    },

    getCourseImage(course) {
      // Використовуємо cover_image з API відповіді
      if (course && course.cover_image) {
        return getImageUrl(course.cover_image)
      }
      // Fallback на імпортований placeholder
      return coursePlaceholder
    },

    getInstructorAvatar(instructor) {
      // Використовуємо avatar з API відповіді
      if (instructor && instructor.avatar) {
        return instructor.avatar
      }
      // Fallback на імпортований placeholder
      return coursePlaceholder
    },

    getUserAvatar(user) {
      // Використовуємо avatar з API відповіді
      if (user && user.avatar) {
        return user.avatar
      }
      // Fallback на імпортований placeholder
      return coursePlaceholder
    },

    getLessonIcon(lessonType) {
      const icons = {
        video: 'mdi-play-circle',
        text: 'mdi-text',
        quiz: 'mdi-help-circle',
        assignment: 'mdi-file-document',
        live: 'mdi-video',
      }
      return icons[lessonType] || 'mdi-file'
    },

    parseWhatYouLearn(text) {
      if (!text) return []
      return text.split('\n').filter((line) => line.trim())
    },

    parseRequirements(text) {
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

    async buyCourse() {
      this.purchaseLoading = true
      try {
        // Логіка покупки курсу
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.showMessage({
          type: 'success',
          text: 'Курс успішно придбано!',
        })

        // Перенаправлення на сторінку "Мої курси"
        this.$router.push('/my-courses')
      } catch (error) {
        console.error('Помилка покупки курсу:', error)
        this.showMessage({
          type: 'error',
          text: 'Помилка при покупці курсу',
        })
      } finally {
        this.purchaseLoading = false
      }
    },

    async addToCart() {
      this.cartLoading = true
      try {
        // Логіка додавання до корзини
        await new Promise((resolve) => setTimeout(resolve, 500))

        this.showMessage({
          type: 'success',
          text: `Курс "${this.course.title}" додано до корзини`,
        })
      } catch (error) {
        console.error('Помилка додавання до корзини:', error)
        this.showMessage({
          type: 'error',
          text: 'Помилка додавання до корзини',
        })
      } finally {
        this.cartLoading = false
      }
    },

    toggleWishlist() {
      this.isInWishlist = !this.isInWishlist

      this.showMessage({
        type: 'success',
        text: this.isInWishlist ? `Курс додано до улюбленого` : `Курс видалено з улюбленого`,
      })
    },

    goToCourse(courseId) {
      this.$router.push(`/courses/${courseId}`)
    },

    showMessage(message) {
      this.snackbar = {
        show: true,
        message: message.text,
        color: message.type === 'error' ? 'error' : 'success',
        timeout: 4000,
      }
    },

    async calculateTotalLessons() {
      try {
        const modules = await coursesApi.getModulesByCourse(this.course.id)
        this.totalLessons = modules.data.data.reduce((total, module) => {
          return total + (module.lessons?.length || 0)
        }, 0)
      } catch (error) {
        console.error('Помилка підрахунку уроків:', error)
      }
    },
  },
}
</script>

<style scoped>
.course-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.course-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.course-cover {
  flex: 0 0 400px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  flex: 1;
}

.course-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.category,
.level {
  padding: 0.5rem 1rem;
  background-color: #f0f2f5;
  border-radius: 4px;
  font-size: 0.9rem;
}

.course-price {
  margin-top: 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 1rem;
}

.discount-price {
  color: #e74c3c;
}

.discount-badge {
  background-color: #e74c3c;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 1rem;
}

.course-content {
  margin-top: 2rem;
}

.course-video {
  width: 100%;
  aspect-ratio: 16/9;
  margin-bottom: 2rem;
}

.course-video iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.course-description,
.course-requirements,
.course-what-you-learn {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.course-stats {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.stat-item i {
  font-size: 1.5rem;
  color: #3498db;
}
</style>
