<template>
  <div class="my-courses">
    <h2>Мої курси</h2>
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="courses.length === 0" class="empty">У вас ще немає курсів.</div>
    <div v-else class="courses-list">
      <div v-for="enrollment in courses" :key="enrollment.id" class="course-card" @click="goToCourse(enrollment.course.id)">
        <img :src="enrollment.course.cover_url || coursePlaceholder" alt="cover" class="course-cover" />
        <div class="course-info">
          <h3>{{ enrollment.course.title }}</h3>
          <p>{{ enrollment.course.short_description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserEnrollments } from '../../services/api';
import coursePlaceholder from '../../assets/img/course-placeholder.jpg';

export default {
  name: 'MyCourses',
  data() {
    return {
      loading: true,
      error: null,
      courses: [],
      coursePlaceholder
    };
  },
  async created() {
    this.loading = true;
    try {
      const data = await getUserEnrollments();
      this.courses = data.enrollments || data.data || [];
      this.loading = false;
    } catch (e) {
      this.error = e?.response?.data?.message || e?.message || 'Помилка завантаження курсів';
      this.loading = false;
    }
  },
  methods: {
    goToCourse(courseId) {
      this.$router.push(`/my-courses/${courseId}`);
    }
  }
}
</script>

<style scoped>
.my-courses {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 12px;
}
.loading, .error, .empty {
  text-align: center;
  margin: 40px 0;
  font-size: 18px;
}
.courses-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: flex-start;
}
.course-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  width: 270px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.course-card:hover {
  box-shadow: 0 4px 16px rgba(29,182,184,0.15);
}
.course-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.course-info {
  padding: 16px;
}
@media (max-width: 900px) {
  .courses-list {
    gap: 16px;
  }
  .course-card {
    width: 45vw;
    min-width: 180px;
    max-width: 100%;
  }
}
@media (max-width: 600px) {
  .courses-list {
    flex-direction: column;
    gap: 12px;
  }
  .course-card {
    width: 100%;
    min-width: unset;
  }
  .course-cover {
    height: 120px;
  }
}
</style> 