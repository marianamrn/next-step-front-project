<template>
  <div class="my-course-detail">
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="course-banner-card mb-5" elevation="3">
            <div class="course-banner">
              <img :src="getCourseImage()" alt="cover" class="course-banner-img" />
              <div class="course-banner-overlay">
                <div class="course-banner-title">{{ course.title }}</div>
                <div class="course-banner-meta">
                  <span class="course-banner-rating">
                    <v-icon size="18" color="#FFD700">mdi-star</v-icon>
                    {{ (course.average_rating || course.rating || 0).toFixed(1) }}
                  </span>
                  <span class="course-banner-students">
                    <v-icon size="18" color="#fff">mdi-account-group</v-icon>
                    {{ course.students_count ?? course.enrollments_count ?? 0 }} студентів
                  </span>
                </div>
              </div>
            </div>
          </v-card>

          <v-card class="mb-5" elevation="2">
            <v-card-text>
              <div class="course-extra-info-modern">
                <div v-if="Array.isArray(course.what_you_learn) && course.what_you_learn.length" class="learn-block">
                  <h3>Чого ви навчитесь?</h3>
                  <div class="learn-list-modern">
                    <div v-for="(item, idx) in course.what_you_learn" :key="'learn-' + idx" class="learn-item">
                      <v-icon color="#4CAF50" size="20">mdi-check-circle</v-icon>
                      <span>{{ item }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="Array.isArray(course.requirements) && course.requirements.length" class="req-block">
                  <h4>Вимоги до курсу</h4>
                  <ul>
                    <li v-for="(item, idx) in course.requirements" :key="'req-' + idx">{{ item }}</li>
                  </ul>
                </div>
              </div>
              <div class="course-description-modern">{{ course.description }}</div>
            </v-card-text>
          </v-card>

          <section class="modules-section">
            <h2 class="modules-title">Модулі та уроки</h2>
            <div class="modules-list">
              <UserModuleItem
                v-for="(module, idx) in course.modules"
                :key="module.id"
                :module="module"
                :index="idx"
                @view-lesson="openLessonModal"
              />
            </div>
          </section>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="2">
            <v-card-title>Деталі курсу</v-card-title>
            <v-list dense>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account-tie</v-icon>
                </template>
                <v-list-item-title>Інструктор</v-list-item-title>
                <v-list-item-subtitle>{{ course.instructor?.full_name || course.instructor?.name || '—' }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-layers</v-icon>
                </template>
                <v-list-item-title>Категорія</v-list-item-title>
                <v-list-item-subtitle>{{ course.category?.name || '—' }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-signal</v-icon>
                </template>
                <v-list-item-title>Рівень</v-list-item-title>
                <v-list-item-subtitle>{{ course.level?.name || '—' }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-translate</v-icon>
                </template>
                <v-list-item-title>Мова</v-list-item-title>
                <v-list-item-subtitle>{{ course.language || '—' }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-play-circle</v-icon>
                </template>
                <v-list-item-title>Уроків</v-list-item-title>
                <v-list-item-subtitle>{{ totalLessons }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Студентів</v-list-item-title>
                <v-list-item-subtitle>{{ course.students_count ?? course.enrollments_count ?? '—' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      <UserLessonViewModal v-if="showLessonModal && selectedLesson" :lesson="selectedLesson" @close="showLessonModal = false" />
      <v-dialog v-model="lessonLoading" persistent max-width="300">
        <v-card class="pa-4" style="text-align:center;">
          <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
          <div>Завантаження уроку...</div>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import { getCourseById, checkCourseAccess, getImageUrl } from '../../services/api';
import { lessonsApi } from '../../services/api';
import coursePlaceholder from '../../assets/img/course-placeholder.jpg';
import UserModuleItem from './UserModuleItem.vue';
import UserLessonViewModal from './UserLessonViewModal.vue';

export default {
  name: 'MyCourseDetail',
  components: { UserModuleItem, UserLessonViewModal },
  data() {
    return {
      loading: true,
      error: null,
      course: {},
      hasAccess: false,
      modules: [],
      coursePlaceholder,
      showLessonModal: false,
      selectedLesson: null,
      lessonLoading: false
    };
  },
  computed: {
    totalLessons() {
      return Array.isArray(this.modules)
        ? this.modules.reduce((sum, m) => sum + (Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
        : 0;
    }
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
      this.modules = Array.isArray(this.course.modules) ? this.course.modules : [];
      this.loading = false;
    } catch (e) {
      this.error = e?.response?.data?.message || e?.message || 'Помилка завантаження курсу';
      this.loading = false;
    }
  },
  methods: {
    getCourseImage() {
      return this.course && this.course.cover_image ? getImageUrl(this.course.cover_image) : this.coursePlaceholder;
    },
    async onViewLesson(lesson) {
      this.lessonLoading = true;
      try {
        const response = await lessonsApi.getLessonById(lesson.id);
        const lessonData = response.data.data || response.data.lesson || response.data;
        this.selectedLesson = { ...lesson, ...lessonData };
        this.showLessonModal = true;
      } catch (e) {
        this.selectedLesson = lesson;
        this.showLessonModal = true;
      } finally {
        this.lessonLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.my-course-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 12px;
}
.loading, .error, .no-access, .empty {
  text-align: center;
  margin: 40px 0;
  font-size: 18px;
}
.course-banner-card {
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(124,58,237,0.10);
}
.course-banner {
  position: relative;
  height: 220px;
  background: linear-gradient(90deg, #7c3aed 0%, #1db6b8 100%);
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}
.course-banner-img {
  width: 320px;
  height: 100%;
  object-fit: cover;
  border-radius: 0 18px 18px 0;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
}
.course-banner-overlay {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px 36px;
  color: white;
}
.course-banner-title {
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -1px;
}
.course-banner-meta {
  display: flex;
  gap: 32px;
  font-size: 1.1rem;
  align-items: center;
}
.course-banner-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}
.course-banner-students {
  display: flex;
  align-items: center;
  gap: 6px;
}
.course-extra-info-modern {
  display: flex;
  gap: 48px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.learn-block {
  flex: 2;
}
.learn-list-modern {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
.learn-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
  color: #333;
}
.req-block {
  flex: 1;
}
.course-description-modern {
  font-size: 1.1rem;
  color: #444;
  margin-top: 18px;
  margin-bottom: 8px;
}
.modules-aligned-card {
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0 4px 24px rgba(124,58,237,0.08);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 24px;
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
  .course-details {
    grid-template-columns: 1fr;
  }
}
.modules-section {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 40px auto;
  padding: 0 16px;
}
.modules-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 28px;
  color: #2d2254;
  letter-spacing: -1px;
}
.modules-list {
  width: 100%;
}
</style> 