<template>
  <v-dialog :model-value="!!lesson" @update:model-value="$emit('close')" max-width="900px">
    <v-card v-if="lesson" class="lesson-view-modal">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ lesson.title }}</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
      </v-card-title>
      
      <v-divider></v-divider>

      <v-card-text class="modal-body">
        <!-- Основна інформація -->
        <div class="lesson-meta-info">
          <v-chip-group>
            <v-chip color="primary" label>
              <v-icon start icon="mdi-book-open-variant"></v-icon>
              {{ getLessonType(lessonType) }}
            </v-chip>
            <v-chip v-if="lesson.description" label>
              <v-icon start icon="mdi-information-outline"></v-icon>
              {{ lesson.description }}
            </v-chip>
          </v-chip-group>
        </div>

        <!-- Контент уроку -->
        <div class="lesson-content-area mt-4">
          <!-- Лекція -->
          <div v-if="lessonType === 'lecture'">
            <h3 class="content-header">Контент лекції</h3>
            <div v-if="lessonContent" v-html="renderMarkdown(lessonContent)" class="markdown-body"></div>
            <div v-if="lessonFile" class="file-card">
              <v-icon size="40" color="primary">mdi-file-document-outline</v-icon>
              <div class="file-details">
                <span class="file-name">{{ getFileName(lessonFile) }}</span>
                <span class="file-action-text">Файл лекції</span>
              </div>
              <v-btn :href="lessonFile" target="_blank" color="primary" variant="tonal">
                <v-icon left>mdi-download</v-icon>Завантажити
              </v-btn>
            </div>
            <v-alert v-if="!lessonContent && !lessonFile" type="info" variant="tonal">
              Контент для цієї лекції ще не додано.
            </v-alert>
          </div>

          <!-- Тест -->
          <div v-if="lessonType === 'test'">
             <h3 class="content-header">Інформація про тест</h3>
             <v-list lines="two">
                <v-list-item title="Тип джерела" :subtitle="testSourceType === 'url' ? 'Зовнішнє посилання' : 'Внутрішній тест'"></v-list-item>
                <v-list-item v-if="testExternalUrl" title="Посилання на тест">
                   <template v-slot:subtitle>
                      <a :href="testExternalUrl" target="_blank">{{ testExternalUrl }}</a>
                   </template>
                </v-list-item>
                <v-list-item title="Обмеження часу" :subtitle="testTimeLimit ? `${testTimeLimit} хвилин` : 'Не вказано'"></v-list-item>
                <v-list-item title="Прохідний бал" :subtitle="testPassingScore ? `${testPassingScore}%` : 'Не вказано'"></v-list-item>
             </v-list>
          </div>

          <!-- Додатковий матеріал -->
          <div v-if="lessonType === 'extra_material'">
             <h3 class="content-header">Додатковий матеріал: {{ getMaterialType(materialType) }}</h3>
             
             <!-- Текст -->
             <div v-if="materialType === 'text' && materialContent" v-html="renderMarkdown(materialContent)" class="markdown-body"></div>

             <!-- URL (Відео з YouTube) -->
             <div v-if="materialType === 'url' && isYoutubeVideo(materialUrl)" class="video-embed-container">
                <iframe :src="getYoutubeEmbedUrl(materialUrl)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
             </div>

             <!-- URL (звичайне посилання) -->
             <div v-else-if="materialType === 'url' && materialUrl" class="url-card">
                <v-icon size="40" color="primary">mdi-link-variant</v-icon>
                <div class="file-details">
                   <a :href="materialUrl" target="_blank" class="file-name">{{ materialUrl }}</a>
                   <span class="file-action-text">Зовнішнє посилання</span>
                </div>
                <v-btn :href="materialUrl" target="_blank" color="primary" variant="tonal">
                   <v-icon left>mdi-open-in-new</v-icon>Відкрити
                </v-btn>
             </div>
             
             <!-- Файл/Відео/Зображення -->
              <div v-if="['file', 'video', 'image'].includes(materialType) && materialFile" class="file-card">
                <v-icon size="40" color="primary">{{ getMaterialIcon(materialType) }}</v-icon>
                <div class="file-details">
                  <span class="file-name">{{ getFileName(materialFile) }}</span>
                  <span class="file-action-text">{{ getMaterialType(materialType) }}</span>
                </div>
                <v-btn :href="materialFile" target="_blank" color="primary" variant="tonal">
                  <v-icon left>mdi-download</v-icon>Завантажити
                </v-btn>
              </div>

             <v-alert v-if="!materialContent && !materialUrl && !materialFile" type="info" variant="tonal">
                Для цього матеріалу ще не додано контент.
             </v-alert>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>
      
      <v-card-actions class="modal-footer">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="$emit('close')">Закрити</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { getLessonFileUrl } from '@/services/api.js';
import { marked } from 'marked';

export default {
  name: 'UserLessonViewModal',
  props: {
    lesson: {
      type: Object,
      required: true,
    },
  },
  computed: {
    lessonType() {
      return this.lesson?.type || 'lecture';
    },
    // Lecture data
    lessonContent() {
      return this.lesson?.lecture?.content || '';
    },
    lessonFile() {
      const path = this.lesson?.lecture?.file_path;
      return path ? getLessonFileUrl(path) : null;
    },
    // Test data
    testSourceType() {
      return this.lesson?.test?.source_type || '';
    },
    testExternalUrl() {
      return this.lesson?.test?.external_url || '';
    },
    testTimeLimit() {
      return this.lesson?.test?.time_limit_minutes || null;
    },
    testPassingScore() {
      return this.lesson?.test?.passing_score || null;
    },
    // Extra Material data
    materialType() {
      return this.lesson?.extra_material?.material_type || '';
    },
    materialContent() {
      return this.lesson?.extra_material?.content || '';
    },
    materialUrl() {
      return this.lesson?.extra_material?.url || '';
    },
    materialFile() {
      const path = this.lesson?.extra_material?.file_path;
      return path ? getLessonFileUrl(path) : null;
    },
  },
  methods: {
    getLessonType(type) {
      const types = {
        lecture: 'Лекція',
        test: 'Тест',
        extra_material: 'Додатковий матеріал',
      };
      return types[type] || type;
    },
    getMaterialType(type) {
      const types = {
        text: 'Текст',
        url: 'Посилання',
        file: 'Файл',
        video: 'Відео',
        image: 'Зображення',
      };
      return types[type] || type;
    },
    getMaterialIcon(type) {
        const icons = {
            file: 'mdi-file-document-outline',
            video: 'mdi-file-video-outline',
            image: 'mdi-file-image-outline',
        };
        return icons[type] || 'mdi-file-question-outline';
    },
    getFileName(url) {
        if (!url) return '';
        try {
            const urlObject = new URL(url);
            const pathSegments = urlObject.pathname.split('/');
            return decodeURIComponent(pathSegments.pop() || '');
        } catch (e) {
            return url.split('/').pop() || '';
        }
    },
    renderMarkdown(text) {
        if (!text) return '';
        return marked.parse(text);
    },
    isYoutubeVideo(url) {
        if (!url) return false;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        return url.match(regExp);
    },
    getYoutubeEmbedUrl(url) {
        if (!url) return '';
        const videoId = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)[2];
        return `https://www.youtube.com/embed/${videoId}`;
    }
  },
};
</script>

<style scoped>
.modal-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 16px 24px;
}
.content-header {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}
.markdown-body {
  font-family: 'VinnytsiaSansReg', sans-serif;
  line-height: 1.6;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}
.markdown-body :deep(p) {
  margin-bottom: 16px;
}
.file-card, .url-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.file-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.file-name {
  font-weight: 500;
}
.file-action-text {
  font-size: 0.8rem;
  color: #666;
}
.video-embed-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  overflow: hidden;
  border-radius: 8px;
}
.video-embed-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style> 