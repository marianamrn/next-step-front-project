<template>
  <div class="my-course-detail">
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!hasAccess" class="no-access">
      <h3>Немає доступу до курсу</h3>
      <p>Для доступу до курсу необхідно його придбати.</p>
    </div>
    <div v-else class="course-content">
      <div class="course-header">
        <img :src="course.cover_url || coursePlaceholder" alt="cover" class="course-cover" />
        <div class="course-info">
          <h2>{{ course.title }}</h2>
          <p>{{ course.short_description }}</p>
          <div class="progress-bar">
            <div class="progress" :style="{width: progress + '%'}"></div>
          </div>
          <div class="progress-label">Прогрес: {{ progress }}%</div>
        </div>
      </div>
      <div class="lessons-list">
        <h3>Уроки курсу</h3>
        <ul>
          <li v-for="lesson in lessons" :key="lesson.id" :class="{'completed': lesson.completed}">
            <span>{{ lesson.title }}</span>
            <span v-if="lesson.completed" class="status">✓</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getCourseById, checkCourseAccess } from '../../services/api';
import coursePlaceholder from '../../assets/img/course-placeholder.jpg';

export default {
  name: 'MyCourseDetail',
  data() {
    return {
      loading: true,
      error: null,
      course: null,
      hasAccess: false,
      lessons: [],
      progress: 0,
      coursePlaceholder
    };
  },
  async created() {
    this.loading = true;
    const courseId = this.$route.params.id;
    try {
      const [courseResp, accessResp] = await Promise.all([
        getCourseById(courseId),
        checkCourseAccess(courseId)
      ]);
      this.course = courseResp.course || courseResp;
      this.hasAccess = accessResp.has_access || accessResp.access || false;
      // lessons та статистика проходження (імітація, якщо API не повертає)
      this.lessons = this.course.modules?.flatMap(m => m.lessons || []) || [];
      // Якщо є статистика проходження — підставити, інакше імітувати
      if (accessResp.enrollment && accessResp.enrollment.progress) {
        this.progress = Math.round(accessResp.enrollment.progress);
        // Позначити завершені уроки
        const completedIds = accessResp.enrollment.completed_lessons || [];
        this.lessons = this.lessons.map(lesson => ({
          ...lesson,
          completed: completedIds.includes(lesson.id)
        }));
      } else {
        this.progress = 0;
        this.lessons = this.lessons.map(lesson => ({ ...lesson, completed: false }));
      }
      this.loading = false;
    } catch (e) {
      this.error = e?.response?.data?.message || e?.message || 'Помилка завантаження курсу';
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.my-course-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 12px;
}
.loading, .error, .no-access {
  text-align: center;
  margin: 40px 0;
  font-size: 18px;
}
.course-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.course-cover {
  width: 220px;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  background: #f5f5f5;
}
.course-info {
  flex: 1;
  min-width: 220px;
}
.progress-bar {
  width: 100%;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  margin: 16px 0 4px 0;
  overflow: hidden;
}
.progress {
  height: 100%;
  background: #1db6b8;
  border-radius: 6px 0 0 6px;
  transition: width 0.4s;
}
.progress-label {
  font-size: 14px;
  color: #666;
}
.lessons-list {
  margin-top: 24px;
}
.lessons-list ul {
  list-style: none;
  padding: 0;
}
.lessons-list li {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}
.lessons-list li.completed {
  color: #1db6b8;
  font-weight: 500;
}
.status {
  font-size: 18px;
  color: #1db6b8;
}
@media (max-width: 700px) {
  .course-header {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .course-cover {
    width: 100%;
    height: 120px;
  }
}
</style> 