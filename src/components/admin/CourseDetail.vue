<!-- src/components/admin/CourseDetail.vue -->
<template>
  <div class="course-detail">
    <!-- Заголовок і основна інформація -->
    <div class="course-header" :style="courseHeaderStyle">
      <div class="course-overlay"></div>
      <div class="course-info">
        <div class="course-category">{{ course.category }}</div>
        <h1 class="course-title">{{ course.title }}</h1>
        <div class="course-status" :class="course.published ? 'published' : 'draft'">
          {{ course.published ? 'Опубліковано' : 'Чернетка' }}
        </div>
        <div class="course-price">{{ course.price }} грн</div>
      </div>
      <div class="course-actions">
        <v-btn 
          color="white" 
          class="edit-button" 
          height="36" 
          @click="$emit('edit-course', course)"
        >
          <v-icon left size="18">mdi-pencil</v-icon>
          Редагувати курс
        </v-btn>
        <v-btn 
          v-if="!course.published && course.lessons.length > 0" 
          color="#4caf50" 
          dark
          height="36"
          class="publish-button" 
          @click="$emit('publish-course', course)"
        >
          <v-icon left size="18">mdi-bookmark</v-icon>
          Опублікувати курс
        </v-btn>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Перегляд детальної інформації про урок, якщо вибрано -->
      <lesson-detail
        v-if="selectedLesson"
        :lesson="selectedLesson"
        @back="selectedLesson = null"
        @edit="$emit('edit-lesson', $event)"
        @publish="$emit('publish-lesson', $event)"
      />
      
      <!-- Інформація про курс та уроки, якщо урок не вибрано -->
      <template v-else>
        <!-- Опис курсу -->
        <div class="course-description">
          <h2>Опис курсу</h2>
          <p>{{ course.description }}</p>
        </div>
        
        <!-- Список уроків -->
        <lesson-list 
          :lessons="course.lessons"
          @add-lesson="$emit('add-lesson')"
          @view-lesson="viewLesson"
          @edit-lesson="$emit('edit-lesson', $event)"
          @publish-lesson="$emit('publish-lesson', $event)"
          @delete-lesson="$emit('delete-lesson', $event)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import LessonDetail from './LessonDetail.vue';
import LessonList from './LessonList.vue';

export default {
  name: 'CourseDetail',
  components: {
    LessonDetail,
    LessonList
  },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedLesson: null
    }
  },
  computed: {
    courseHeaderStyle() {
      if (this.course.coverImage) {
        return {
          backgroundImage: `url(${this.course.coverImage})`
        };
      }
      return {
        backgroundColor: '#443BC9'
      };
    }
  },
  methods: {
    viewLesson(lesson) {
      this.selectedLesson = lesson;
    }
  }
};
</script>

<style scoped>
.course-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-header {
  position: relative;
  color: white;
  padding: 40px;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.course-info {
  position: relative;
  z-index: 2;
}

.course-category {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
  display: inline-block;
}

.course-title {
  font-size: 32px;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.course-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
}

.published {
  background-color: #4caf50;
  color: white;
}

.draft {
  background-color: #ff9800;
  color: white;
}

.course-price {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.course-actions {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 2;
}

.edit-button, .publish-button {
  text-transform: none;
  font-weight: 500;
}

.content-wrapper {
  flex: 1;
  padding: 30px;
  background-color: #f9fafb;
  overflow-y: auto;
}

.course-description {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.course-description h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.course-description p {
  margin: 0;
  line-height: 1.6;
  color: #333;
  white-space: pre-line;
}
</style>