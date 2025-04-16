<!-- src\components\admin\courses-management\CourseDetail.vue -->
<template>
  <div class="course-detail">
    <!-- Заголовок і основна інформація -->
    <div class="course-header" :style="courseHeaderStyle">
      <div class="course-overlay"></div>
      <div class="back-button" @click="$emit('back')">
        <v-icon left>mdi-arrow-left</v-icon>
        Повернутися до списку курсів
      </div>
      <div class="course-info">
        <div class="course-category">{{ categoryName }}</div>
        <h1 class="course-title">{{ course.title }}</h1>
        <div class="course-status" :class="course.is_published ? 'published' : 'draft'">
          {{ course.is_published ? 'Опубліковано' : 'Чернетка' }}
        </div>
        <div class="course-price">{{ formattedPrice }}</div>
      </div>
      <div class="course-actions">
        <button class="edit-button" @click="$emit('edit-course', course)">
          <v-icon left size="18">mdi-pencil</v-icon>
          Редагувати курс
        </button>
        <button
          v-if="!course.is_published && hasLessons"
          class="publish-button"
          @click="$emit('publish-course', course)"
        >
          <v-icon left size="18">mdi-bookmark</v-icon>
          Опублікувати курс
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Опис курсу -->
      <div class="course-description">
        <h2>Опис курсу</h2>
        <div class="description-text">{{ course.description || 'Опис відсутній' }}</div>
      </div>

      <!-- Додаткова інформація про курс -->
      <div class="course-details">
        <div class="detail-item">
          <div class="detail-label">Рівень складності:</div>
          <div class="detail-value">{{ levelName }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Мова:</div>
          <div class="detail-value">{{ course.language || 'Не вказано' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Інструктор:</div>
          <div class="detail-value">{{ instructorName }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Що ви вивчите:</div>
          <div class="detail-value what-you-learn">
            <ul v-if="formattedWhatYouLearn.length > 0">
              <li v-for="(item, index) in formattedWhatYouLearn" :key="index">{{ item }}</li>
            </ul>
            <span v-else>Не вказано</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Вимоги:</div>
          <div class="detail-value requirements">
            <ul v-if="formattedRequirements.length > 0">
              <li v-for="(item, index) in formattedRequirements" :key="index">{{ item }}</li>
            </ul>
            <span v-else>Не вказано</span>
          </div>
        </div>
      </div>

      <!-- Список уроків -->
      <div class="lessons-section">
        <div class="section-header">
          <h2>Уроки курсу</h2>
          <button class="add-lesson-button" @click="$emit('add-lesson')">
            <v-icon left size="18">mdi-plus</v-icon>
            Додати урок
          </button>
        </div>

        <div v-if="!hasLessons" class="no-lessons">
          У цього курсу ще немає уроків. Додайте перший урок для можливості публікації курсу.
        </div>

        <div v-else class="lessons-list">
          <div v-for="(lesson, index) in course.lessons" :key="lesson.id" class="lesson-item">
            <div class="lesson-index">{{ index + 1 }}</div>
            <div class="lesson-info">
              <div class="lesson-title">{{ lesson.title }}</div>
              <div class="lesson-status" :class="lesson.is_published ? 'published' : 'draft'">
                {{ lesson.is_published ? 'Опубліковано' : 'Чернетка' }}
              </div>
            </div>
            <div class="lesson-actions">
              <button class="action-button edit" @click="$emit('edit-lesson', lesson)">
                <v-icon size="16">mdi-pencil</v-icon>
              </button>
              <button
                v-if="!lesson.is_published"
                class="action-button publish"
                @click="$emit('publish-lesson', lesson)"
              >
                <v-icon size="16">mdi-bookmark</v-icon>
              </button>
              <button class="action-button delete" @click="$emit('delete-lesson', lesson)">
                <v-icon size="16">mdi-delete</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/services/api.js'

export default {
  name: 'CourseDetail',
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  computed: {
    courseHeaderStyle() {
      if (this.course.cover_image) {
        return {
          backgroundImage: `url(${getImageUrl(this.course.cover_image)})`,
        }
      }
      return {
        backgroundColor: '#443BC9',
      }
    },
    categoryName() {
      return this.course.category ? this.course.category.name : 'Категорія не вказана'
    },
    levelName() {
      return this.course.level ? this.course.level.name : 'Не вказано'
    },
    instructorName() {
      if (this.course.instructor) {
        return (
          this.course.instructor.full_name ||
          `${this.course.instructor.first_name} ${this.course.instructor.last_name}`
        )
      }
      return 'Не вказано'
    },
    formattedPrice() {
      if (this.course.is_on_discount && this.course.discount_price) {
        return `${this.course.discount_price} грн (Знижка з ${this.course.price} грн)`
      }
      return `${this.course.price} грн`
    },
    formattedWhatYouLearn() {
      if (!this.course.what_you_learn) return []
      return this.course.what_you_learn.split('\n').filter((item) => item.trim().length > 0)
    },
    formattedRequirements() {
      if (!this.course.requirements) return []
      return this.course.requirements.split('\n').filter((item) => item.trim().length > 0)
    },
    hasLessons() {
      return this.course.lessons && this.course.lessons.length > 0
    },
  },
}
</script>

<style scoped>
.course-detail {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 70px);
}

.course-header {
  position: relative;
  color: white;
  padding: 40px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 250px;
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

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  z-index: 2;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.course-info {
  position: relative;
  z-index: 2;
  margin-bottom: 20px;
}

.course-category {
  background-color: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
}

.course-title {
  font-size: 32px;
  margin: 0 0 15px 0;
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
  margin-left: auto;
}

.edit-button,
.publish-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.edit-button {
  background-color: white;
  color: #333;
}

.publish-button {
  background-color: #4caf50;
  color: white;
}

.content-wrapper {
  flex: 1;
  padding: 30px;
  background-color: #f9fafb;
  overflow-y: auto;
}

.course-description,
.course-details,
.lessons-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.course-description h2,
.course-details h2,
.lessons-section h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 20px;
}

.description-text {
  white-space: pre-line;
  line-height: 1.6;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 500;
  margin-bottom: 5px;
}

.detail-value {
  color: #555;
}

.what-you-learn ul,
.requirements ul {
  padding-left: 20px;
  margin: 0;
}

.what-you-learn li,
.requirements li {
  margin-bottom: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-lesson-button {
  display: flex;
  align-items: center;
  background-color: #443bc9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-weight: 500;
  cursor: pointer;
}

.add-lesson-button:hover {
  background-color: #3730a3;
}

.no-lessons {
  padding: 30px;
  text-align: center;
  background-color: #f0f2f5;
  border-radius: 5px;
  color: #666;
}

.lessons-list {
  display: grid;
  gap: 10px;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 5px;
}

.lesson-index {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #443bc9;
  color: white;
  font-weight: bold;
  margin-right: 15px;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.lesson-status {
  display: inline-block;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}

.lesson-actions {
  display: flex;
  gap: 5px;
}

.action-button {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
}

.edit {
  background-color: #2196f3;
  color: white;
}

.publish {
  background-color: #4caf50;
  color: white;
}

.delete {
  background-color: #f44336;
  color: white;
}
</style>
