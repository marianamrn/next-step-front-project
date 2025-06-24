<template>
  <div class="my-courses">
    <h2>Мої курси</h2>
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
</style> 