<!-- src/components/admin/LessonDetail.vue -->
<template>
  <div class="lesson-detail">
    <!-- Заголовок з кнопкою повернення -->
    <div class="lesson-header">
      <v-btn text color="#443BC9" class="back-button" @click="$emit('back')">
        <v-icon left size="20">mdi-arrow-left</v-icon>
        Повернутися до курсу
      </v-btn>
      <h1 class="lesson-title">{{ lesson.title }}</h1>
      <div class="lesson-status" :class="lesson.published ? 'published' : 'draft'">
        {{ lesson.published ? 'Опубліковано' : 'Чернетка' }}
      </div>
    </div>

    <!-- Контент уроку -->
    <div class="lesson-content">
      <h2>Опис уроку</h2>
      <div class="content-text">{{ lesson.content }}</div>
    </div>

    <!-- Відео з YouTube -->
    <div v-if="lesson.videoUrl" class="lesson-video">
      <h2>Відео</h2>
      <div class="video-container">
        <iframe 
          :src="getYouTubeEmbedUrl(lesson.videoUrl)" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <!-- Матеріали уроку -->
    <div class="lesson-materials">
      <h2>Матеріали уроку</h2>
      
      <!-- PDF документ -->
      <div v-if="lesson.pdfUrl" class="material-item">
        <div class="material-icon pdf-icon">
          <v-icon>mdi-file-pdf-box</v-icon>
        </div>
        <div class="material-info">
          <div class="material-title">PDF-лекція</div>
          <div class="material-description">Навчальний матеріал до уроку</div>
        </div>
        <v-btn text color="#333" class="material-button" :href="lesson.pdfUrl" target="_blank">
          <v-icon left size="20">mdi-download</v-icon>
          Відкрити
        </v-btn>
      </div>

      <!-- Google Form для завдань -->
      <div v-if="lesson.formUrl" class="material-item">
        <div class="material-icon form-icon">
          <v-icon>mdi-file-document-outline</v-icon>
        </div>
        <div class="material-info">
          <div class="material-title">Завдання до уроку</div>
          <div class="material-description">Тест для перевірки знань</div>
        </div>
        <v-btn text color="#333" class="material-button" :href="lesson.formUrl" target="_blank">
          <v-icon left size="20">mdi-open-in-new</v-icon>
          Пройти тест
        </v-btn>
      </div>
    </div>

    <!-- Кнопки управління -->
    <div class="lesson-actions">
      <v-btn 
        color="#443BC9" 
        dark 
        height="36"
        class="edit-button" 
        @click="$emit('edit', lesson)"
      >
        <v-icon left size="18">mdi-pencil</v-icon>
        Редагувати урок
      </v-btn>
      <v-btn 
        v-if="!lesson.published" 
        color="#4caf50" 
        dark 
        height="36"
        class="publish-button" 
        @click="$emit('publish', lesson)"
      >
        <v-icon left size="18">mdi-bookmark</v-icon>
        Опублікувати урок
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LessonDetail',
  props: {
    lesson: {
      type: Object,
      required: true
    }
  },
  methods: {
    getYouTubeEmbedUrl(url) {
      // Отримання ID відео з YouTube-посилання
      let videoId = url;
      
      // Якщо це повне посилання, витягуємо ID
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
          const urlObj = new URL(url);
          if (url.includes('youtube.com/watch')) {
            videoId = urlObj.searchParams.get('v');
          } else if (url.includes('youtu.be/')) {
            videoId = urlObj.pathname.split('/')[1];
          }
        } catch (e) {
          console.error('Неправильний формат URL:', e);
        }
      }
      
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
};
</script>

<style scoped>
.lesson-detail {
  padding: 30px;
  background-color: #f9fafb;
  height: 100%;
}

.lesson-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.back-button {
  margin-right: 20px;
  padding: 0;
  text-transform: none;
  font-weight: 500;
}

.lesson-title {
  margin: 0;
  font-size: 24px;
  flex: 1;
}

.lesson-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.published {
  background-color: #4caf50;
  color: white;
}

.draft {
  background-color: #ff9800;
  color: white;
}

.lesson-content, .lesson-video, .lesson-materials {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(82, 20, 20, 0.1);
}

.content-text {
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* Співвідношення сторін 16:9 */
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
}

.lesson-materials h2, .lesson-content h2, .lesson-video h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.material-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  margin-bottom: 10px;
}

.material-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 15px;
}

.pdf-icon {
  background-color: #f44336;
  color: white;
}

.form-icon {
  background-color: #4285f4;
  color: white;
}

.material-info {
  flex: 1;
}

.material-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.material-description {
  font-size: 14px;
  color: #666;
}

.material-button {
  text-transform: none;
}

.lesson-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.edit-button, .publish-button {
  text-transform: none;
  font-weight: 500;
}
</style>