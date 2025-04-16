<!-- src\components\admin\courses-management\CourseCard.vue -->
<template>
  <div class="course-card" @click="$emit('click', course)">
    <div class="course-cover">
      <img :src="coverImage" :alt="course.title" />
      <div class="course-status" :class="course.is_published ? 'published' : 'draft'">
        {{ course.is_published ? 'Опубліковано' : 'Чернетка' }}
      </div>
    </div>

    <div class="course-info">
      <h3 class="course-title">{{ course.title }}</h3>
      <div class="course-category">{{ categoryName }}</div>
      <div class="course-price">{{ formattedPrice }}</div>
      <div class="course-lessons">{{ lessonsCount }} {{ getLessonsText(lessonsCount) }}</div>
    </div>

    <div class="course-actions">
      <button class="edit-button" @click.stop="$emit('edit', course)">
        <v-icon left size="18">mdi-pencil</v-icon>
        Редагувати
      </button>
      <button
        v-if="!course.is_published && hasLessons"
        class="publish-button"
        @click.stop="$emit('publish', course)"
      >
        <v-icon left size="18">mdi-bookmark</v-icon>
        Опублікувати
      </button>
      <button
        v-if="course.is_published"
        class="unpublish-button"
        @click.stop="$emit('unpublish', course)"
      >
        <v-icon left size="18">mdi-bookmark-off</v-icon>
        Скасувати публікацію
      </button>
      <button class="delete-button" @click.stop="$emit('delete', course)">
        <v-icon left size="18">mdi-delete</v-icon>
        Видалити
      </button>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/services/api.js'
import placeholderImage from '@/assets/img/course-placeholder.jpg'

export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  computed: {
    coverImage() {
      if (this.course.cover_image) {
        return getImageUrl(this.course.cover_image)
      }
      return placeholderImage
    },
    categoryName() {
      return this.course.category ? this.course.category.name : 'Категорія не вказана'
    },
    formattedPrice() {
      if (this.course.is_on_discount && this.course.discount_price) {
        return `${this.course.discount_price} грн (Знижка з ${this.course.price} грн)`
      }
      return `${this.course.price} грн`
    },
    lessonsCount() {
      return this.course.lessons ? this.course.lessons.length : 0
    },
    hasLessons() {
      return this.lessonsCount > 0
    },
  },
  methods: {
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
  },
}
</script>

<style scoped>
.course-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.course-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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

.course-info {
  padding: 15px;
}

.course-title {
  font-size: 18px;
  margin: 0 0 10px 0;
}

.course-category {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.course-price {
  font-weight: bold;
  margin-bottom: 5px;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-weight: normal;
  font-size: 0.9em;
  margin-left: 5px;
}

.course-lessons {
  font-size: 14px;
  color: #666;
}

.course-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 15px 15px;
  gap: 8px;
}

.edit-button,
.publish-button,
.unpublish-button,
.delete-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.edit-button {
  color: #443bc9;
}

.publish-button {
  color: #4caf50;
}

.unpublish-button {
  color: #ff9800;
}

.delete-button {
  color: #f44336;
}

.edit-button:hover,
.publish-button:hover,
.unpublish-button:hover,
.delete-button:hover {
  text-decoration: underline;
}
</style>
