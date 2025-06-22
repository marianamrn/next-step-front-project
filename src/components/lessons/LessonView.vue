<template>
  <div class="lesson-view-container">
    <!-- Заголовок уроку -->
    <div class="lesson-header">
      <div class="lesson-header-content">
        <div class="lesson-title-section">
          <h1 class="lesson-title">{{ lesson?.title || 'Завантаження...' }}</h1>
          <div class="lesson-meta">
            <span class="lesson-type">{{ getLessonTypeName(lesson?.type) }}</span>
            <span class="lesson-position">Урок {{ lesson?.position }}</span>
          </div>
        </div>
        <div class="lesson-actions">
          <v-btn
            v-if="isAdmin"
            color="primary"
            variant="outlined"
            @click="editLesson"
            class="edit-btn"
          >
            <v-icon left>mdi-pencil</v-icon>
            Редагувати
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            @click="goBack"
            class="back-btn"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Назад
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Основний контент -->
    <div class="lesson-content-wrapper">
      <div class="lesson-content">
        <!-- Опис уроку -->
        <div class="lesson-description" v-if="lesson?.description">
          <h3>Опис уроку</h3>
          <p>{{ lesson.description }}</p>
        </div>

        <!-- Контент залежно від типу уроку -->
        <div class="lesson-main-content">
          <!-- Лекція -->
          <div v-if="lesson?.type === 'lecture'" class="lecture-content">
            <div class="content-section">
              <h3>Контент лекції</h3>
              
              <!-- Текстовий контент -->
              <div v-if="lectureContent" class="text-content">
                <div class="markdown-content" v-html="renderMarkdown(lectureContent)"></div>
              </div>

              <!-- Файл лекції -->
              <div v-if="lectureFile" class="file-content">
                <div class="file-card">
                  <div class="file-icon">
                    <v-icon size="48" color="#f44336">mdi-file-pdf-box</v-icon>
                  </div>
                  <div class="file-info">
                    <h4>Файл лекції</h4>
                    <p>{{ getFileName(lectureFile) }}</p>
                  </div>
                  <div class="file-actions">
                    <v-btn
                      color="primary"
                      @click="downloadFile(lectureFile)"
                      class="download-btn"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Завантажити
                    </v-btn>
                    <v-btn
                      color="secondary"
                      variant="outlined"
                      @click="openFile(lectureFile)"
                      class="view-btn"
                    >
                      <v-icon left>mdi-eye</v-icon>
                      Переглянути
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Тривалість -->
              <div v-if="lectureDuration" class="duration-info">
                <v-icon color="#666">mdi-clock-outline</v-icon>
                <span>Тривалість: {{ lectureDuration }} хвилин</span>
              </div>
            </div>
          </div>

          <!-- Тест -->
          <div v-if="lesson?.type === 'test'" class="test-content">
            <div class="content-section">
              <h3>Інформація про тест</h3>
              
              <div class="test-info-grid">
                <div class="info-item">
                  <div class="info-label">Тип джерела:</div>
                  <div class="info-value">
                    {{ testSourceType === 'external' ? 'Зовнішнє посилання' : 'Внутрішній тест' }}
                  </div>
                </div>

                <div v-if="testExternalUrl" class="info-item">
                  <div class="info-label">Посилання на тест:</div>
                  <div class="info-value">
                    <v-btn
                      color="primary"
                      @click="openTest(testExternalUrl)"
                      class="test-link-btn"
                    >
                      <v-icon left>mdi-open-in-new</v-icon>
                      Відкрити тест
                    </v-btn>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">Обмеження часу:</div>
                  <div class="info-value">
                    {{ testTimeLimit || 'Не вказано' }} хвилин
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-label">Прохідний бал:</div>
                  <div class="info-value">
                    {{ testPassingScore || 'Не вказано' }}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Додатковий матеріал -->
          <div v-if="lesson?.type === 'extra_material'" class="material-content">
            <div class="content-section">
              <h3>Додатковий матеріал</h3>
              
              <div class="material-info">
                <div class="info-item">
                  <div class="info-label">Тип матеріалу:</div>
                  <div class="info-value">{{ getMaterialTypeName(materialType) }}</div>
                </div>
              </div>

              <!-- Текстовий матеріал -->
              <div v-if="materialType === 'text' && materialContent" class="text-content">
                <div class="markdown-content" v-html="renderMarkdown(materialContent)"></div>
              </div>

              <!-- Посилання (якщо це відео з ютуб) -->
              <div v-if="materialType === 'url' && isYoutubeVideo(materialUrl)" class="video-content">
                <div class="video-card">
                  <h4>Відео матеріал</h4>
                  <div class="video-container">
                    <iframe
                      :src="getYoutubeEmbedUrl(materialUrl)"
                      width="560"
                      height="315"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      class="video-player"
                    ></iframe>
                  </div>
                </div>
              </div>
              
              <!-- Посилання -->
              <div v-else-if="materialType === 'url' && materialUrl" class="url-content">
                <div class="url-card">
                  <div class="url-icon">
                    <v-icon size="32" color="#2196f3">mdi-link</v-icon>
                  </div>
                  <div class="url-info">
                    <h4>Зовнішнє посилання</h4>
                    <p>{{ materialUrl }}</p>
                  </div>
                  <div class="url-actions">
                    <v-btn
                      color="primary"
                      @click="openUrl(materialUrl)"
                      class="open-url-btn"
                    >
                      <v-icon left>mdi-open-in-new</v-icon>
                      Відкрити
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Файл матеріалу -->
              <div v-if="['file', 'video', 'image'].includes(materialType) && materialFile" class="file-content">
                <div class="file-card">
                  <div class="file-icon">
                    <v-icon size="48" :color="getMaterialIconColor(materialType)">
                      {{ getMaterialIcon(materialType) }}
                    </v-icon>
                  </div>
                  <div class="file-info">
                    <h4>{{ getMaterialTypeName(materialType) }}</h4>
                    <p>{{ getFileName(materialFile) }}</p>
                  </div>
                  <div class="file-actions">
                    <v-btn
                      color="primary"
                      @click="downloadFile(materialFile)"
                      class="download-btn"
                    >
                      <v-icon left>mdi-download</v-icon>
                      Завантажити
                    </v-btn>
                    <v-btn
                      color="secondary"
                      variant="outlined"
                      @click="openFile(materialFile)"
                      class="view-btn"
                    >
                      <v-icon left>mdi-eye</v-icon>
                      Переглянути
                    </v-btn>
                  </div>
                </div>
              </div>

              <!-- Відео матеріал -->
              <div v-if="materialType === 'video' && materialFile" class="video-content">
                <div class="video-card">
                  <h4>Відео матеріал</h4>
                  <div class="video-container">
                    <video controls class="video-player">
                      <source :src="materialFile" type="video/mp4">
                      Ваш браузер не підтримує відео.
                    </video>
                  </div>
                </div>
              </div>

              <!-- Зображення -->
              <div v-if="materialType === 'image' && materialFile" class="image-content">
                <div class="image-card">
                  <h4>Зображення</h4>
                  <div class="image-container">
                    <img :src="materialFile" alt="Зображення матеріалу" class="material-image">
                  </div>
                </div>
              </div>

              <!-- Повідомлення, якщо матеріал не знайдено -->
              <div v-if="!materialContent && !materialUrl && !materialFile" class="no-content">
                <v-alert type="info" variant="tonal">
                  <template v-slot:prepend>
                    <v-icon>mdi-information-outline</v-icon>
                  </template>
                  Для цього матеріалу ще не додано контент.
                </v-alert>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Бічна панель з навігацією -->
      <div class="lesson-sidebar">
        <div class="sidebar-section">
          <h4>Навігація по модулю</h4>
          <div class="lessons-list">
            <div
              v-for="lessonItem in moduleLessons"
              :key="lessonItem.id"
              class="lesson-item"
              :class="{ active: lessonItem.id === lesson?.id }"
              @click="navigateToLesson(lessonItem.id)"
            >
              <div class="lesson-item-content">
                <div class="lesson-item-icon">
                  <v-icon :color="getLessonTypeColor(lessonItem.type)">
                    {{ getLessonTypeIcon(lessonItem.type) }}
                  </v-icon>
                </div>
                <div class="lesson-item-info">
                  <div class="lesson-item-title">{{ lessonItem.title }}</div>
                  <div class="lesson-item-type">{{ getLessonTypeName(lessonItem.type) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <p>Завантаження уроку...</p>
    </div>
  </div>
</template>

<script>
import { lessonsApi, getLessonFileUrl } from '@/services/api.js'

export default {
  name: 'LessonView',
  props: {
    courseId: {
      type: [String, Number],
      required: true
    },
    lessonId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      lesson: null,
      moduleLessons: [],
      loading: true,
      error: null
    }
  },
  computed: {
    isAdmin() {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return ['super_admin', 'admin', 'teacher'].includes(user.role?.name)
    },
    // Лекція
    lectureContent() {
      return this.lesson?.lecture?.content || ''
    },
    lectureDuration() {
      return this.lesson?.lecture?.duration_minutes
    },
    lectureFile() {
      const filePath = this.lesson?.lecture?.file_path
      return filePath ? getLessonFileUrl(filePath) : null
    },
    // Тест
    testSourceType() {
      return this.lesson?.test?.source_type
    },
    testExternalUrl() {
      return this.lesson?.test?.external_url
    },
    testTimeLimit() {
      return this.lesson?.test?.time_limit_minutes
    },
    testPassingScore() {
      return this.lesson?.test?.passing_score
    },
    // Додатковий матеріал
    materialType() {
      return this.lesson?.extra_material?.material_type
    },
    materialContent() {
      return this.lesson?.extra_material?.content
    },
    materialUrl() {
      return this.lesson?.extra_material?.url
    },
    materialFile() {
      const filePath = this.lesson?.extra_material?.file_path
      return filePath ? getLessonFileUrl(filePath) : null
    }
  },
  async mounted() {
    await this.loadLesson()
  },
  watch: {
    lesson: {
      handler(newVal) {
        if (newVal) {
          this.loadModuleLessons()
        }
      },
      immediate: true
    }
  },
  methods: {
    async loadLesson() {
      try {
        this.loading = true
        const response = await lessonsApi.getLessonById(this.lessonId)
        this.lesson = response.data.lesson
      } catch (error) {
        console.error('Помилка завантаження уроку:', error)
        this.error = 'Помилка завантаження уроку'
      } finally {
        this.loading = false
      }
    },
    async loadModuleLessons() {
      try {
        if (this.lesson?.module_id) {
          const response = await lessonsApi.getLessonsByModule(this.lesson.module_id)
          this.moduleLessons = response.data.lessons || []
        }
      } catch (error) {
        console.error('Помилка завантаження уроків модуля:', error)
      }
    },
    getLessonTypeName(type) {
      const types = {
        lecture: 'Лекція',
        test: 'Тест',
        extra_material: 'Додатковий матеріал'
      }
      return types[type] || type
    },
    getLessonTypeIcon(type) {
      const icons = {
        lecture: 'mdi-book-open-variant',
        test: 'mdi-clipboard-check',
        extra_material: 'mdi-file-plus'
      }
      return icons[type] || 'mdi-file'
    },
    getLessonTypeColor(type) {
      const colors = {
        lecture: '#2196f3',
        test: '#4caf50',
        extra_material: '#ff9800'
      }
      return colors[type] || '#666'
    },
    getMaterialTypeName(type) {
      const types = {
        text: 'Текст',
        url: 'Посилання',
        file: 'Файл',
        video: 'Відео',
        image: 'Зображення'
      }
      return types[type] || type
    },
    getMaterialIcon(type) {
      const icons = {
        text: 'mdi-text',
        url: 'mdi-link',
        file: 'mdi-file',
        video: 'mdi-video',
        image: 'mdi-image'
      }
      return icons[type] || 'mdi-file'
    },
    getMaterialIconColor(type) {
      const colors = {
        text: '#2196f3',
        url: '#4caf50',
        file: '#f44336',
        video: '#e91e63',
        image: '#9c27b0'
      }
      return colors[type] || '#666'
    },
    getYoutubeEmbedUrl(url) {
      if (!url) return '';
      let videoId;
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
          videoId = urlObj.pathname.slice(1);
        } else {
          videoId = urlObj.searchParams.get('v');
        }
      } catch (e) {
        // Fallback for invalid URLs
        videoId = url.split('v=')[1] || url.split('/').pop();
      }
      
      if (videoId) {
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return '';
    },
    renderMarkdown(content) {
      if (!content) return ''
      // Простий рендеринг markdown
      return content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br>')
    },
    getFileName(filePath) {
      if (!filePath) return ''
      return filePath.split('/').pop() || filePath
    },
    downloadFile(filePath) {
      if (!filePath) return
      const link = document.createElement('a')
      link.href = filePath
      link.download = this.getFileName(filePath)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    openFile(filePath) {
      if (!filePath) return
      window.open(filePath, '_blank')
    },
    openUrl(url) {
      if (!url) return
      window.open(url, '_blank')
    },
    openTest(url) {
      if (!url) return
      window.open(url, '_blank')
    },
    isYoutubeVideo(url) {
      if (!url) return false;
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
      return youtubeRegex.test(url);
    },
    navigateToLesson(lessonId) {
      if (this.lessonId == lessonId) return;
      this.$router.push(`/admin/courses/${this.courseId}/lesson/${lessonId}`)
    },
    editLesson() {
      this.$router.push(`/admin/courses/${this.courseId}/lesson/${this.lessonId}/edit`)
    },
    goBack() {
      this.$router.push(`/admin/courses/${this.courseId}`)
    }
  }
}
</script>

<style scoped>
.lesson-view-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.lesson-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.lesson-header-content {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.lesson-title-section {
  flex: 1;
}

.lesson-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.lesson-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.lesson-type {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.lesson-position {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.lesson-actions {
  display: flex;
  gap: 12px;
}

.lesson-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.lesson-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.lesson-description {
  padding: 24px 32px;
  border-bottom: 1px solid #f0f0f0;
}

.lesson-description h3 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 1.25rem;
  font-weight: 600;
}

.lesson-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

.lesson-main-content {
  padding: 32px;
}

.content-section h3 {
  margin: 0 0 24px 0;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 600;
}

.text-content {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.markdown-content {
  line-height: 1.6;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.markdown-content h1 {
  font-size: 1.75rem;
  font-weight: 700;
}

.markdown-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

.markdown-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.markdown-content strong {
  font-weight: 600;
  color: #1a1a1a;
}

.markdown-content em {
  font-style: italic;
  color: #666;
}

.file-content {
  margin-bottom: 24px;
}

.file-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.file-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.file-icon {
  flex-shrink: 0;
}

.file-info {
  flex: 1;
}

.file-info h4 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-size: 1.125rem;
  font-weight: 600;
}

.file-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.file-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.duration-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.875rem;
  margin-top: 16px;
}

.test-info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.info-label {
  font-weight: 600;
  color: #1a1a1a;
}

.info-value {
  color: #666;
}

.test-link-btn {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  color: white !important;
}

.material-info {
  margin-bottom: 24px;
}

.url-content {
  margin-bottom: 24px;
}

.url-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.url-card:hover {
  border-color: #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.1);
}

.url-icon {
  flex-shrink: 0;
}

.url-info {
  flex: 1;
}

.url-info h4 {
  margin: 0 0 8px 0;
  color: #1a1a1a;
  font-size: 1.125rem;
  font-weight: 600;
}

.url-info p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
  word-break: break-all;
}

.url-actions {
  flex-shrink: 0;
}

.video-content,
.image-content {
  margin-bottom: 24px;
}

.video-card,
.image-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e9ecef;
}

.video-card h4,
.image-card h4 {
  margin: 0 0 16px 0;
  color: #1a1a1a;
  font-size: 1.125rem;
  font-weight: 600;
}

.video-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-container {
  text-align: center;
}

.material-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.lesson-sidebar {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.sidebar-section {
  padding: 24px;
}

.sidebar-section h4 {
  margin: 0 0 20px 0;
  color: #1a1a1a;
  font-size: 1.125rem;
  font-weight: 600;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lesson-item {
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.lesson-item:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.lesson-item.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: #667eea;
}

.lesson-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lesson-item-icon {
  flex-shrink: 0;
}

.lesson-item-info {
  flex: 1;
  min-width: 0;
}

.lesson-item-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 4px;
  line-height: 1.3;
}

.lesson-item-type {
  font-size: 0.75rem;
  opacity: 0.8;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-overlay p {
  margin-top: 16px;
  color: #666;
  font-size: 1rem;
}

/* Responsive design */
@media (max-width: 1200px) {
  .lesson-content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .lesson-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .lesson-view-container {
    padding: 12px;
  }
  
  .lesson-header-content {
    flex-direction: column;
    padding: 24px;
  }
  
  .lesson-title {
    font-size: 2rem;
  }
  
  .lesson-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .lesson-main-content {
    padding: 24px;
  }
  
  .file-card,
  .url-card {
    flex-direction: column;
    text-align: center;
  }
  
  .file-actions,
  .url-actions {
    width: 100%;
    justify-content: center;
  }
}
</style> 