<!-- LessonViewModal.vue -->
<template>
  <div class="modal-overlay" v-if="lesson">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ lesson.title }}</h2>
        <button class="close-button" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>

      <div class="modal-body">
        <!-- Основна інформація про урок -->
        <div class="lesson-info">
          <div class="info-item">
            <div class="info-label">Тип уроку:</div>
            <div class="info-value">{{ getLessonType(lessonType) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Опис:</div>
            <div class="info-value">{{ lesson.description || 'Опис відсутній' }}</div>
          </div>
        </div>

        <!-- Контент уроку залежно від типу -->
        <div class="lesson-content">
          <!-- Для лекції -->
          <div v-if="lessonType === 'lecture'" class="lecture-content">
            <h3>Контент лекції</h3>
            <div v-if="lessonContent" class="content-text">{{ lessonContent }}</div>

            <!-- Тривалість -->
            <div v-if="lessonDuration" class="duration">
              Тривалість: {{ lessonDuration }} хвилин
            </div>

            <!-- Файл лекції, якщо є -->
            <div v-if="lessonFile" class="file-preview">
              <div class="file-info">
                <v-icon color="#f44336">mdi-file-pdf-box</v-icon>
                <a :href="lessonFile" target="_blank" class="file-link">Відкрити файл лекції</a>
              </div>
            </div>
          </div>

          <!-- Для тесту -->
          <div v-if="lessonType === 'test'" class="test-content">
            <h3>Інформація про тест</h3>

            <div class="info-item">
              <div class="info-label">Тип джерела:</div>
              <div class="info-value">
                {{ testSourceType === 'url' ? 'Зовнішнє посилання' : 'Внутрішній тест' }}
              </div>
            </div>

            <div v-if="testExternalUrl" class="info-item">
              <div class="info-label">Посилання на тест:</div>
              <div class="info-value">
                <a :href="testExternalUrl" target="_blank" class="test-link"> Відкрити тест </a>
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">Обмеження часу:</div>
              <div class="info-value">{{ testTimeLimit || 'Не вказано' }} хвилин</div>
            </div>

            <div class="info-item">
              <div class="info-label">Прохідний бал:</div>
              <div class="info-value">{{ testPassingScore || 'Не вказано' }}%</div>
            </div>
          </div>

          <!-- Для додаткового матеріалу -->
          <div v-if="lessonType === 'extra_material'" class="material-content">
            <h3>Додатковий матеріал</h3>

            <div class="info-item">
              <div class="info-label">Тип матеріалу:</div>
              <div class="info-value">
                {{ getMaterialType(materialType) }}
              </div>
            </div>

            <!-- Текстовий матеріал -->
            <div v-if="materialType === 'text' && materialContent" class="content-text">
              {{ materialContent }}
            </div>

            <!-- Посилання -->
            <div v-if="materialType === 'url' && materialUrl" class="material-url">
              <a :href="materialUrl" target="_blank" class="material-link"> Відкрити посилання </a>
            </div>

            <!-- Файл матеріалу -->
            <div v-if="materialFile" class="file-preview">
              <div class="file-info">
                <v-icon :color="getMaterialIconColor(materialType)">
                  {{ getMaterialIcon(materialType) }}
                </v-icon>
                <a :href="materialFile" target="_blank" class="file-link"> Відкрити матеріал </a>
              </div>
            </div>
          </div>

          <!-- Відео контент, якщо є -->
          <div v-if="lessonVideoUrl" class="video-content">
            <h3>Відео</h3>
            <div class="video-container">
              <iframe
                :src="getYouTubeEmbedUrl(lessonVideoUrl)"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="close-btn" @click="$emit('close')">Закрити</button>
        <button class="edit-btn" @click="$emit('edit', lesson)">Редагувати</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/services/api.js'

export default {
  name: 'LessonViewModal',
  props: {
    lesson: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // Обчислювані властивості для вилучення даних із різних можливих структур відповіді API
    lessonType() {
      return (
        this.lesson.type || (this.lesson.lesson_type && this.lesson.lesson_type.name) || 'lecture'
      )
    },

    lessonContent() {
      return this.lesson.content || (this.lesson.lecture && this.lesson.lecture.content) || ''
    },

    lessonDuration() {
      return (
        this.lesson.duration_minutes ||
        (this.lesson.lecture && this.lesson.lecture.duration_minutes) ||
        null
      )
    },

    lessonFile() {
      if (this.lesson.file) {
        return this.getFileUrl(this.lesson.file)
      } else if (this.lesson.lecture && this.lesson.lecture.file_path) {
        return this.getFileUrl(this.lesson.lecture.file_path)
      }
      return null
    },

    lessonVideoUrl() {
      return this.lesson.video_url || ''
    },

    // Властивості для тесту
    testSourceType() {
      return this.lesson.source_type || (this.lesson.test && this.lesson.test.source_type) || 'url'
    },

    testExternalUrl() {
      return this.lesson.external_url || (this.lesson.test && this.lesson.test.external_url) || ''
    },

    testTimeLimit() {
      return (
        this.lesson.time_limit_minutes ||
        (this.lesson.test && this.lesson.test.time_limit_minutes) ||
        null
      )
    },

    testPassingScore() {
      return (
        this.lesson.passing_score || (this.lesson.test && this.lesson.test.passing_score) || null
      )
    },

    // Властивості для додаткового матеріалу
    materialType() {
      return (
        this.lesson.material_type ||
        (this.lesson.extra_material && this.lesson.extra_material.material_type) ||
        'text'
      )
    },

    materialContent() {
      return (
        this.lesson.material_content ||
        (this.lesson.extra_material && this.lesson.extra_material.content) ||
        ''
      )
    },

    materialUrl() {
      return (
        this.lesson.material_url ||
        (this.lesson.extra_material && this.lesson.extra_material.url) ||
        ''
      )
    },

    materialFile() {
      if (this.lesson.material_file) {
        return this.getFileUrl(this.lesson.material_file)
      } else if (this.lesson.extra_material && this.lesson.extra_material.file_path) {
        return this.getFileUrl(this.lesson.extra_material.file_path)
      }
      return null
    },
  },
  methods: {
    getLessonType(type) {
      const types = {
        lecture: 'Лекція',
        test: 'Тест',
        extra_material: 'Додатковий матеріал',
        assignment: 'Завдання',
        quiz: 'Тестування',
        video: 'Відео',
      }
      return types[type] || type
    },

    getMaterialType(type) {
      const types = {
        text: 'Текст',
        url: 'Посилання',
        file: 'Файл',
        video: 'Відео',
        image: 'Зображення',
      }
      return types[type] || type
    },

    getMaterialIcon(type) {
      const icons = {
        file: 'mdi-file-document',
        video: 'mdi-video',
        image: 'mdi-image',
        url: 'mdi-link',
        text: 'mdi-text-box',
      }
      return icons[type] || 'mdi-file'
    },

    getMaterialIconColor(type) {
      const colors = {
        file: '#2196f3',
        video: '#f44336',
        image: '#4caf50',
        url: '#ff9800',
        text: '#9c27b0',
      }
      return colors[type] || '#666'
    },

    getFileUrl(path) {
      if (!path) return null

      if (path.startsWith('http')) {
        return path
      }

      return getImageUrl(path) // Функція з api.js для отримання URL файлу
    },

    getYouTubeEmbedUrl(url) {
      // Отримання ID відео з YouTube-посилання
      if (!url) return ''

      let videoId = url

      // Якщо це повне посилання, витягуємо ID
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
          const urlObj = new URL(url)
          if (url.includes('youtube.com/watch')) {
            videoId = urlObj.searchParams.get('v')
          } else if (url.includes('youtu.be/')) {
            videoId = urlObj.pathname.split('/')[1]
          }
        } catch (e) {
          console.error('Неправильний формат URL:', e)
        }
      }

      return `https://www.youtube.com/embed/${videoId}`
    },
  },
  mounted() {
    // Логуємо структуру даних для налагодження
    console.log('Дані уроку в модальному вікні:', this.lesson)
  },
}
</script>

<style scoped>
/* Стилі для модального вікна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #e1e1e1;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 130px);
}

.lesson-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e1e1;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
}

.info-label {
  font-weight: 500;
  margin-right: 8px;
  min-width: 120px;
}

.lesson-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.content-text {
  white-space: pre-line;
  line-height: 1.6;
  color: #333;
  margin-bottom: 15px;
}

.duration {
  margin-top: 10px;
  font-style: italic;
  color: #666;
}

.file-preview {
  margin-top: 15px;
  padding: 12px;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.file-info {
  display: flex;
  align-items: center;
}

.file-link,
.test-link,
.material-link {
  margin-left: 10px;
  color: #443bc9;
  text-decoration: none;
}

.file-link:hover,
.test-link:hover,
.material-link:hover {
  text-decoration: underline;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e1e1e1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.close-btn,
.edit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.close-btn {
  background-color: #f0f2f5;
  color: #333;
}

.edit-btn {
  background-color: #443bc9;
  color: white;
}

/* Стилі для відео */
.video-content {
  margin-top: 20px;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* Для співвідношення сторін 16:9 */
  height: 0;
  overflow: hidden;
  margin-top: 15px;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 4px;
}
</style>
