<template>
  <div class="user-module-card">
    <div class="module-header" @click="toggleExpanded">
      <div class="module-index">{{ index + 1 }}</div>
      <div class="module-info">
        <div class="module-title">{{ module.title }}</div>
        <div class="module-description">{{ module.description }}</div>
        <div class="module-lessons-count">
          {{ lessonsCount }} {{ getLessonsText(lessonsCount) }}
        </div>
      </div>
      <div class="module-actions">
        <button class="action-button" @click.stop="toggleExpanded">
          <v-icon small>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </button>
      </div>
    </div>
    <transition name="fade">
      <div v-if="expanded" class="module-content">
        <div class="lessons-header">
          <h3>Уроки</h3>
        </div>
        <div v-if="!module.lessons || module.lessons.length === 0" class="no-lessons">
          У цьому модулі ще немає уроків.
        </div>
        <div v-else class="lessons-list">
          <div v-for="(lesson, lessonIndex) in module.lessons" :key="lesson.id" class="lesson-item">
            <div class="lesson-info">
              <div class="lesson-index">{{ lessonIndex + 1 }}</div>
              <div class="lesson-details">
                <div class="lesson-title">{{ lesson.title }}</div>
                <div class="lesson-type">{{ getLessonType(lesson.type) }}</div>
              </div>
            </div>
            <div class="lesson-actions">
              <button class="action-button" @click="$emit('view-lesson', lesson)">
                <v-icon small>mdi-eye</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'UserModuleItem',
  props: {
    module: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      expanded: false,
    }
  },
  computed: {
    lessonsCount() {
      return this.module.lessons ? this.module.lessons.length : 0
    }
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded
    },
    getLessonsText(count) {
      if (count % 10 === 1 && count % 100 !== 11) {
        return 'урок'
      } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'уроки'
      } else {
        return 'уроків'
      }
    },
    getLessonType(type) {
      const types = {
        lecture: 'Лекція',
        test: 'Тест',
        extra_material: 'Додатковий матеріал',
        assignment: 'Завдання',
      }
      return types[type] || type
    },
  },
}
</script>

<style scoped>
.user-module-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(124,58,237,0.08);
  margin-bottom: 28px;
  transition: box-shadow 0.2s, transform 0.2s;
  width: 100%;
  overflow: hidden;
}
.user-module-card:hover {
  box-shadow: 0 8px 32px rgba(124,58,237,0.13);
  transform: translateY(-2px) scale(1.01);
}
.module-header {
  display: flex;
  align-items: center;
  padding: 20px 28px 20px 24px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.module-header:hover {
  background-color: #f5f5f5;
}
.module-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: #443bc9;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.3rem;
  margin-right: 20px;
}
.module-info {
  flex: 1;
}
.module-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1.18rem;
}
.module-description {
  color: #666;
  font-size: 15px;
  margin-bottom: 4px;
}
.module-lessons-count {
  font-size: 14px;
  color: #888;
}
.module-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.module-content {
  padding: 0 28px 18px 28px;
}
.no-lessons {
  color: #888;
  font-size: 15px;
  margin: 12px 0;
}
.lessons-list {
  margin-top: 8px;
}
.lesson-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ececf2;
  cursor: pointer;
  transition: background 0.15s;
}
.lesson-item:last-child {
  border-bottom: none;
}
.lesson-item:hover {
  background: #f8f8fa;
}
.lesson-info {
  display: flex;
  align-items: center;
  flex: 1;
}
.lesson-index {
  width: 28px;
  height: 28px;
  background: #e0e0e0;
  color: #443bc9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-right: 12px;
}
.lesson-details {
  flex: 1;
}
.lesson-title {
  font-size: 15px;
  font-weight: 500;
}
.lesson-type {
  font-size: 13px;
  color: #888;
}
.lesson-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}
.action-button:hover {
  background-color: rgba(68,59,201,0.08);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style> 