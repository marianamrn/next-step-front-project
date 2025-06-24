<template>
  <div class="my-course-detail">
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="mb-5" elevation="2">
            <v-card-title>{{ course.title }}</v-card-title>
            <v-card-text>
              <div class="course-header">
                <img :src="getCourseImage()" alt="cover" class="course-cover" />
                <div class="course-info">
                  <p class="course-description">{{ course.description }}</p>
                  <div class="course-details">
                    <div><strong>Інструктор:</strong> {{ course.instructor?.full_name || course.instructor?.name || '—' }}</div>
                    <div><strong>Категорія:</strong> {{ course.category?.name || '—' }}</div>
                    <div><strong>Рівень:</strong> {{ course.level?.name || '—' }}</div>
                    <div><strong>Мова:</strong> {{ course.language || '—' }}</div>
                    <div><strong>Уроків:</strong> {{ totalLessons }}</div>
                    <div><strong>Студентів:</strong> {{ course.students_count ?? course.enrollments_count ?? '—' }}</div>
                  </div>
                </div>
              </div>
              <div class="course-extra-info">
                <div v-if="Array.isArray(course.what_you_learn) && course.what_you_learn.length">
                  <h4>Чого ви навчитесь</h4>
                  <ul>
                    <li v-for="(item, idx) in course.what_you_learn" :key="'learn-' + idx">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="Array.isArray(course.requirements) && course.requirements.length">
                  <h4>Вимоги до курсу</h4>
                  <ul>
                    <li v-for="(item, idx) in course.requirements" :key="'req-' + idx">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mb-5" elevation="2">
            <v-card-title>Модулі та уроки</v-card-title>
            <v-card-text>
              <div v-if="!Array.isArray(modules) || !modules.length" class="empty">У цього курсу ще немає модулів.</div>
              <UserModuleItem
                v-for="(module, idx) in modules"
                :key="module.id"
                :module="module"
                :index="idx"
                @view-lesson="onViewLesson"
              />
            </v-card-text>
          </v-card>
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
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 12px;
}
.loading, .error, .no-access, .empty {
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
.course-details {
  margin-top: 16px;
  font-size: 15px;
  color: #444;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 24px;
}
.course-description {
  margin: 8px 0 0 0;
  color: #333;
}
.course-extra-info {
  margin-bottom: 32px;
}
.course-extra-info h4 {
  margin: 12px 0 4px 0;
  font-size: 17px;
}
.course-extra-info ul {
  margin: 0 0 8px 0;
  padding-left: 18px;
}
.modules-list {
  margin-top: 24px;
}
.module-block {
  margin-bottom: 18px;
  background: #f8f8fa;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.module-title {
  font-weight: 600;
  font-size: 17px;
  margin-bottom: 8px;
  color: #443bc9;
}
.lessons-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.lessons-list li {
  padding: 7px 0;
  border-bottom: 1px solid #ececf2;
  font-size: 15px;
  color: #222;
}
.lessons-list li:last-child {
  border-bottom: none;
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
</style> 