<!-- src\components\admin\courses-management\CourseDetailsContainer.vue -->
<template>
  <div class="course-details-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Завантаження деталей курсу...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="back-button" @click="$emit('back')">Повернутися до списку курсів</button>
    </div>
    <div v-else-if="course">
      <v-card tile flat class="course-banner">
        <v-img
          :src="course.cover_image ? getImageUrl(course.cover_image) : ''"
          :gradient="course.cover_image ? 'to top, rgba(0,0,0,.8), rgba(0,0,0,0)' : ''"
          class="white--text"
          height="250px"
          cover
        >
          <v-container class="fill-height">
            <v-row class="fill-height" align="end">
              <v-col>
                <div class="banner-back-button" @click="$emit('back')">
                  <v-icon left>mdi-arrow-left</v-icon>
                  Повернутися до списку курсів
                </div>
                <v-chip v-if="categoryName" small color="rgba(255,255,255,0.2)" class="mb-2">
                  {{ categoryName }}
                </v-chip>
                <h1 class="page-title">{{ course.title }}</h1>
                <v-chip :color="course.is_published ? 'success' : 'grey'" small>
                  {{ course.is_published ? 'Опубліковано' : 'Чернетка' }}
                </v-chip>
              </v-col>
            </v-row>
          </v-container>
        </v-img>
      </v-card>
      <course-detail
        :course="course"
        @back="$emit('back')"
        @edit-course="$emit('edit-course', $event)"
        @publish-course="$emit('publish-course', $event)"
        @unpublish-course="$emit('unpublish-course', $event)"
        @delete-course="$emit('delete-course', $event)"
      />
    </div>
  </div>
</template>

<script>
import CourseDetail from './CourseDetail.vue'
import api, { getImageUrl } from '@/services/api.js'

export default {
  name: 'CourseDetailsContainer',
  components: {
    CourseDetail,
  },
  props: {
    courseId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      course: null,
      loading: false,
      error: null,
    }
  },
  watch: {
    courseId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchCourse(newId)
        }
      },
    },
  },
  methods: {
    async fetchCourse(courseId) {
      try {
        this.loading = true
        this.error = null
        const response = await api.courses.getCourseById(courseId)
        let courseData
        if (response.data && response.data.course) {
          courseData = JSON.parse(JSON.stringify(response.data.course))
        } else {
          courseData = JSON.parse(JSON.stringify(response.data))
        }
        if (!courseData.modules) {
          courseData.modules = []
        }
        if (Array.isArray(courseData.modules)) {
          courseData.modules.forEach((module) => {
            if (!module.lessons) {
              module.lessons = []
            }
          })
        }
        this.course = courseData
      } catch (error) {
        this.error = 'Не вдалося завантажити дані курсу.'
        console.error('Помилка при завантаженні курсу:', error)
      } finally {
        this.loading = false
      }
    },
    // Для сумісності зі старим кодом
    loadCourseById(courseId) {
      return this.fetchCourse(courseId)
    },

    // Метод для оновлення даних курсу після змін
    refreshCourse() {
      if (this.course && this.course.id) {
        this.loadCourseById(this.course.id)
      }
    },

    createFallbackCourse(courseId) {
      // Створення тестового курсу для розробки
      return {
        id: parseInt(courseId),
        title: 'Тестовий курс (дані не знайдено)',
        description: 'Курс створено автоматично для тестування інтерфейсу',
        category: { name: 'Тестова категорія' },
        is_published: false,
        price: 999,
        level: { name: 'Початковий' },
        instructor: { full_name: 'Тестовий Викладач' },
        lessons: [],
        requirements: 'Тестові вимоги',
        what_you_learn: 'Тестові знання',
      }
    },

    // Метод для оновлення даних курсу після змін
    refreshCourse() {
      if (this.course && this.course.id) {
        this.loadCourseById(this.course.id)
      }
    },
  },
  computed: {
    categoryName() {
      return this.course && this.course.category ? this.course.category.name : ''
    },
    getImageUrl() {
      return getImageUrl
    }
  },
}
</script>

<style scoped>
.course-details-container {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #443bc9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  width: 100%;
  text-align: center;
  padding: 50px;
  background-color: #fdf2f2;
  border-radius: 8px;
  color: #ef4444;
}

.back-button {
  display: inline-flex;
  align-items: center;
  background-color: #f3f4f6;
  color: #111827;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 15px;
}

.back-button:hover {
  background-color: #e5e7eb;
}

.course-banner {
  margin-top: -20px; /* Adjust to align with header */
  margin-left: -20px;
  margin-right: -20px;
  margin-bottom: 20px;
}

.course-banner .v-image {
  background-color: #4A148C;
}

.banner-back-button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin-bottom: 10px;
  background-color: rgba(0,0,0,0.3);
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
  color: white; /* Ensure text is visible on dark background */
}
.banner-back-button:hover {
    background-color: rgba(0,0,0,0.5);
}

.page-title {
    font-size: 2.5rem;
    font-weight: 500;
    line-height: 1.2;
    text-shadow: 1px 1px 3px rgba(0,0,0,0.7);
    color: white;
}
</style>
