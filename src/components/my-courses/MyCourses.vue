<template>
  <div class="my-courses">
    <div class="my-courses-banner">
      <h1 class="my-courses-title">Мої курси</h1>
      <p class="my-courses-subtitle">Всі курси, на які ви записані. Продовжуйте навчання та відкривайте нові знання!</p>
    </div>
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="courses.length === 0" class="empty">У вас ще немає курсів.</div>
    <div v-else class="courses-list">
      <CourseCard
        v-for="enrollment in courses"
        :key="enrollment.id"
        :course="enrollment.course"
        :showPrice="false"
        :showBuyButton="false"
        :showEnrollButton="false"
        :showFavorite="false"
        @click.native="goToCourse(enrollment.course.id)"
      />
    </div>
  </div>
</template>

<script>
import { getUserEnrollments } from '../../services/api';
import CourseCard from '../courses/CourseCard.vue';

export default {
  name: 'MyCourses',
  components: { CourseCard },
  data() {
    return {
      loading: true,
      error: null,
      courses: []
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 12px 24px 12px;
}
.my-courses-banner {
  background: linear-gradient(90deg, #7c3aed 0%, #1db6b8 100%);
  border-radius: 18px;
  padding: 36px 32px 28px 32px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 6px 32px rgba(124,58,237,0.10);
  text-align: left;
}
.my-courses-title {
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -1px;
}
.my-courses-subtitle {
  font-size: 1.15rem;
  font-weight: 400;
  opacity: 0.95;
}
.loading, .error, .empty {
  text-align: center;
  margin: 40px 0;
  font-size: 18px;
}
.courses-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  justify-content: flex-start;
}
</style> 