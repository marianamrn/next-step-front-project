<!-- src/components/admin/LessonList.vue -->
<template>
    <div class="lesson-list">
      <div class="list-header">
        <h2>Уроки курсу</h2>
        <button class="add-lesson-button" @click="$emit('add-lesson')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Додати урок
        </button>
      </div>
      
      <div v-if="lessons.length === 0" class="no-lessons">
        У цього курсу ще немає уроків. Додайте перший урок.
      </div>
      
      <div v-else class="lessons-container">
        <div v-for="(lesson, index) in lessons" :key="lesson.id" class="lesson-item">
          <div class="lesson-info" @click="$emit('view-lesson', lesson)">
            <div class="lesson-index">{{ index + 1 }}</div>
            <div class="lesson-details">
              <div class="lesson-title">{{ lesson.title }}</div>
              <div class="lesson-status" :class="lesson.published ? 'published' : 'draft'">
                {{ lesson.published ? 'Опубліковано' : 'Чернетка' }}
              </div>
            </div>
          </div>
          <div class="lesson-actions">
            <button class="view-button" @click="$emit('view-lesson', lesson)" title="Переглянути урок">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="edit-button" @click="$emit('edit-lesson', lesson)" title="Редагувати урок">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button v-if="!lesson.published" class="publish-button" @click="$emit('publish-lesson', lesson)" title="Опублікувати урок">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button class="delete-button" @click="$emit('delete-lesson', lesson)" title="Видалити урок">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LessonList',
    props: {
      lessons: {
        type: Array,
        default: () => []
      }
    }
  };
  </script>
  
  <style scoped>
  .lesson-list {
    margin-top: 20px;
  }
  
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .list-header h2 {
    margin: 0;
    font-size: 18px;
  }
  
  .add-lesson-button {
    display: flex;
    align-items: center;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  
  .add-lesson-button svg {
    margin-right: 5px;
  }
  
  .no-lessons {
    padding: 20px;
    text-align: center;
    background-color: #f9fafb;
    border-radius: 5px;
    color: #666;
  }
  
  .lessons-container {
    display: grid;
    gap: 10px;
  }
  
  .lesson-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background-color: #f9fafb;
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .lesson-item:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .lesson-info {
    display: flex;
    align-items: center;
    flex: 1;
    cursor: pointer;
  }
  
  .lesson-index {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: #443BC9;
    color: white;
    border-radius: 50%;
    font-weight: bold;
    margin-right: 15px;
  }
  
  .lesson-details {
    display: flex;
    flex-direction: column;
  }
  
  .lesson-title {
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .lesson-status {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    display: inline-block;
    width: fit-content;
  }
  
  .published {
    background-color: #4caf50;
    color: white;
  }
  
  .draft {
    background-color: #ff9800;
    color: white;
  }
  
  .lesson-actions {
    display: flex;
    gap: 5px;
  }
  
  .view-button, .edit-button, .publish-button, .delete-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
  }
  
  .view-button {
    background-color: #2196f3;
    color: white;
  }
  
  .edit-button {
    background-color: #443BC9;
    color: white;
  }
  
  .publish-button {
    background-color: #4caf50;
    color: white;
  }
  
  .delete-button {
    background-color: #f44336;
    color: white;
  }
  </style>