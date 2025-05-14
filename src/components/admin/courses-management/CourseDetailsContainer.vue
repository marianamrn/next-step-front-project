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
    <course-detail
      v-else-if="course"
      :course="course"
      @back="$emit('back')"
      @edit-course="$emit('edit-course', $event)"
      @publish-course="$emit('publish-course', $event)"
      @unpublish-course="$emit('unpublish-course', $event)"
      @delete-course="$emit('delete-course', $event)"
      @add-lesson="$emit('add-lesson')"
      @edit-lesson="$emit('edit-lesson', $event)"
      @publish-lesson="$emit('publish-lesson', $event)"
      @delete-lesson="$emit('delete-lesson', $event)"
    />
  </div>
</template>

<script>
import CourseDetail from './CourseDetail.vue'
import api from '@/services/api.js'

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
          this.loadCourseById(newId)
        }
      },
    },
  },
  methods: {
    async loadCourseById(courseId) {
      try {
        this.loading = true
        this.error = null

        const response = await api.courses.getCourseById(courseId)

        // Отримуємо і клонуємо дані курсу
        const courseData = JSON.parse(JSON.stringify(response.data.course))
        this.course = courseData
      } catch (error) {
        console.error('Помилка завантаження курсу:', error)
        this.error = 'Помилка завантаження курсу. Спробуйте пізніше.'

        if (process.env.NODE_ENV === 'development') {
          this.course = this.createFallbackCourse(courseId)
        }
      } finally {
        this.loading = false
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
        lessons: [
          {
            id: 1,
            title: 'Урок 1',
            content: 'Тестовий контент',
            is_published: true,
          },
          {
            id: 2,
            title: 'Урок 2',
            content: 'Тестовий контент',
            is_published: false,
          },
        ],
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
</style>
