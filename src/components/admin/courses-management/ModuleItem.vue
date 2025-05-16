<template>
  <div class="module-item">
    <div class="module-header" @click="toggleExpanded">
      <div class="module-index">{{ index + 1 }}</div>
      <div class="module-info">
        <div class="module-title">{{ module.title }}</div>
        <div class="module-description">{{ module.description }}</div>
        <div class="module-lessons-count">
          {{ lessonsCount }} {{ getLessonsText(lessonsCount) }}
        </div>
      </div>
      <div class="module-actions">
        <button class="action-button" @click.stop="$emit('edit-module', module)">
          <v-icon small>mdi-pencil</v-icon>
        </button>
        <button class="action-button" @click.stop="$emit('delete-module', module)">
          <v-icon small>mdi-delete</v-icon>
        </button>
        <button class="action-button" @click.stop="toggleExpanded">
          <v-icon small>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </button>
      </div>
    </div>

    <div v-if="expanded" class="module-content">
      <div class="lessons-header">
        <h3>Уроки</h3>
        <button class="add-lesson-button" @click="$emit('add-lesson', module)">
          <v-icon small left>mdi-plus</v-icon>
          Додати урок
        </button>
      </div>

      <div v-if="loading" class="lessons-loading">
        <div class="spinner"></div>
        <p>Завантаження уроків...</p>
      </div>

      <div v-else-if="!module.lessons || module.lessons.length === 0" class="no-lessons">
        У цьому модулі ще немає уроків. Додайте перший урок.
      </div>

      <div v-else class="lessons-list">
        <div v-for="(lesson, lessonIndex) in module.lessons" :key="lesson.id" class="lesson-item">
          <div class="lesson-info">
            <div class="lesson-index">{{ lessonIndex + 1 }}</div>
            <div class="lesson-details">
              <div class="lesson-title">{{ lesson.title }}</div>
              <div class="lesson-type">{{ getLessonType(lesson.type) }}</div>
            </div>
          </div>
          <div class="lesson-actions">
            <button class="action-button" @click="viewLesson(lesson, module)">
              <v-icon small>mdi-eye</v-icon>
            </button>
            <button class="action-button" @click="editLesson(lesson, module)">
              <v-icon small>mdi-pencil</v-icon>
            </button>
            <button class="action-button" @click="deleteLesson(lesson, module)">
              <v-icon small>mdi-delete</v-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'ModuleItem',
  props: {
    module: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      expanded: false,
      loading: false,
    }
  },
  computed: {
    lessonsCount() {
      return this.module.lessons ? this.module.lessons.length : 0
    },
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded

      // Якщо розгортаємо модуль і уроки ще не завантажені - завантажуємо їх
      if (this.expanded) {
        // Перевіряємо, чи уроки вже є у модулі
        if (this.module.lessons && this.module.lessons.length > 0) {
          console.log('Використовуємо уроки модуля з відповіді API:', this.module.lessons)
          this.$emit('lessons-loaded', {
            moduleId: this.module.id,
            lessons: this.module.lessons,
          })
        } else if (!this.loading) {
          // Якщо уроків немає - завантажуємо їх через API управління
          this.loadManageLessons()
        }
      }
    },

    async loadManageLessons() {
      if (this.loading) return

      this.loading = true
      try {
        // Спочатку перевіряємо, чи є вже уроки в модулі
        if (this.module.lessons && this.module.lessons.length > 0) {
          console.log('Використовуємо уроки модуля з відповіді API:', this.module.lessons)
          return
        }

        // Спробуємо одразу зі стандартного API, минаючи /lessons/manage, який дає 405 помилку
        console.log('Завантаження уроків для модуля:', this.module.id)
        try {
          const response = await api.lessons.getLessonsByModule(this.module.id)

          let lessons = []
          if (response && response.data) {
            if (Array.isArray(response.data)) {
              lessons = response.data
            } else if (response.data.data && Array.isArray(response.data.data)) {
              lessons = response.data.data
            } else if (response.data.lessons && Array.isArray(response.data.lessons)) {
              lessons = response.data.lessons
            }
          }

          console.log('Завантажені уроки для модуля', this.module.id, ':', lessons)

          this.$emit('lessons-loaded', {
            moduleId: this.module.id,
            lessons: lessons,
          })
        } catch (error) {
          console.error('Помилка при завантаженні уроків:', error)
          // Якщо все ж виникла помилка, повертаємо порожній масив
          this.$emit('lessons-loaded', {
            moduleId: this.module.id,
            lessons: [],
          })
        }
      } finally {
        this.loading = false
      }
    },

    // Методи для взаємодії з уроками
    viewLesson(lesson, module) {
      console.log('Перегляд уроку:', lesson)
      this.$emit('view-lesson', lesson, module)
    },

    editLesson(lesson, module) {
      console.log('Редагування уроку:', lesson)
      this.$emit('edit-lesson', lesson, module)
    },

    deleteLesson(lesson, module) {
      console.log('Видалення уроку:', lesson)
      this.$emit('delete-lesson', lesson, module)
    },

    getLessonsText(count) {
      // Функція для правильного відмінювання слова "урок"
      if (count % 10 === 1 && count % 100 !== 11) {
        return 'урок'
      } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'уроки'
      } else {
        return 'уроків'
      }
    },

    getLessonType(type) {
      const types = {
        lecture: 'Лекція',
        test: 'Тест',
        extra_material: 'Додатковий матеріал',
        assignment: 'Завдання',
      }
      return types[type] || type
    },
  },
}
</script>

<style scoped>
.module-item {
  background-color: white;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.module-header {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.module-header:hover {
  background-color: #f5f5f5;
}

.module-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #443bc9;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  margin-right: 16px;
}

.module-info {
  flex: 1;
}

.module-title {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 16px;
}

.module-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.module-lessons-count {
  color: #666;
  font-size: 12px;
}

.module-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.module-content {
  padding: 16px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

.lessons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.lessons-header h3 {
  margin: 0;
  font-size: 16px;
}

.add-lesson-button {
  display: flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.add-lesson-button:hover {
  background-color: #45a049;
}

.no-lessons {
  text-align: center;
  padding: 24px;
  color: #666;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.lesson-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.lesson-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #666;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 12px;
}

.lesson-details {
  flex: 1;
}

.lesson-title {
  font-weight: 500;
  margin-bottom: 2px;
}

.lesson-type {
  font-size: 12px;
  color: #666;
}

.lesson-actions {
  display: flex;
  gap: 4px;
}

.lessons-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #443bc9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
