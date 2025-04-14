<!-- src/components/admin/LessonList.vue -->
<template>
  <div class="lesson-list">
    <div class="list-header">
      <h2>Уроки курсу</h2>
      <v-btn color="#4caf50" dark small height="36" class="add-lesson-button" @click="$emit('add-lesson')">
        <v-icon left size="16">mdi-plus</v-icon>
        Додати урок
      </v-btn>
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
          <v-btn icon small min-width="32" height="46" class="action-button" color="#2196f3" @click="$emit('view-lesson', lesson)" title="Переглянути урок">
            <v-icon size="16">mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small min-width="32" height="46" class="action-button" color="#443BC9" @click="$emit('edit-lesson', lesson)" title="Редагувати урок">
            <v-icon size="16">mdi-pencil</v-icon>
          </v-btn>
          <v-btn 
            v-if="!lesson.published" 
            icon 
            small 
            min-width="32" 
            height="46S" 
            class="action-button" 
            color="#4caf50" 
            @click="$emit('publish-lesson', lesson)" 
            title="Опублікувати урок"
          >
            <v-icon size="16">mdi-bookmark</v-icon>
          </v-btn>
          <v-btn icon small min-width="32" height="46" class="action-button" color="#f44336" @click="$emit('delete-lesson', lesson)" title="Видалити урок">
            <v-icon size="16">mdi-delete</v-icon>
          </v-btn>
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
  text-transform: none;
  font-weight: 500;
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
  cursor: pointer;
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

.action-button {
  border-radius: 4px !important;
}
</style>