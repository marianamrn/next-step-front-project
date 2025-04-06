<!-- src/components/admin/LessonDetail.vue -->
<template>
    <div class="lesson-detail">
      <!-- Заголовок з кнопкою повернення -->
      <div class="lesson-header">
        <button class="back-button" @click="$emit('back')">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Повернутися до курсу
        </button>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="material-info">
            <div class="material-title">PDF-лекція</div>
            <div class="material-description">Навчальний матеріал до уроку</div>
          </div>
          <a :href="lesson.pdfUrl" target="_blank" class="material-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Відкрити
          </a>
        </div>
  
        <!-- Google Form для завдань -->
        <div v-if="lesson.formUrl" class="material-item">
          <div class="material-icon form-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <rect x="8" y="12" width="8" height="2"></rect>
              <rect x="8" y="16" width="8" height="2"></rect>
            </svg>
          </div>
          <div class="material-info">
            <div class="material-title">Завдання до уроку</div>
            <div class="material-description">Тест для перевірки знань</div>
          </div>
          <a :href="lesson.formUrl" target="_blank" class="material-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Пройти тест
          </a>
        </div>
      </div>
  
      <!-- Кнопки управління -->
      <div class="lesson-actions">
        <button class="edit-button" @click="$emit('edit', lesson)">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          Редагувати урок
        </button>
        <button v-if="!lesson.published" class="publish-button" @click="$emit('publish', lesson)">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Опублікувати урок
        </button>
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
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: #443BC9;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    margin-right: 20px;
  }
  
  .back-button svg {
    margin-right: 5px;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    display: flex;
    align-items: center;
    background-color: #f0f2f5;
    color: #333;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 5px;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .material-button:hover {
    background-color: #e1e4e8;
  }
  
  .material-button svg {
    margin-right: 5px;
  }
  
  .lesson-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .edit-button, .publish-button {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 5px;
    border: none;
    font-weight: 500;
    cursor: pointer;
  }
  
  .edit-button {
    background-color: #443BC9;
    color: white;
  }
  
  .publish-button {
    background-color: #4caf50;
    color: white;
  }
  
  .edit-button svg, .publish-button svg {
    margin-right: 8px;
  }
  </style>