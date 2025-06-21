<template>
  <div class="course-detail-view">
    <v-container fluid>
      <!-- Основний контент -->
      <v-row>
        <!-- Ліва колонка -->
        <v-col cols="12" md="8">
          <!-- Промо-відео (тепер завжди під хедером) -->
          <v-card v-if="youtubeEmbedUrl" class="mb-5" elevation="2">
            <v-card-title>Промо-відео</v-card-title>
            <v-responsive :aspect-ratio="16/9">
              <iframe :src="youtubeEmbedUrl" frameborder="0" allowfullscreen></iframe>
            </v-responsive>
          </v-card>
          
          <!-- Опис курсу -->
          <v-card class="mb-5" elevation="2">
            <v-card-title>Опис курсу</v-card-title>
            <v-card-text>{{ course.description || 'Опис відсутній.' }}</v-card-text>
          </v-card>

          <v-row>
            <v-col cols="12" md="6">
              <v-card class="fill-height" elevation="2">
                <v-card-title>Чого ви навчитеся</v-card-title>
                <v-list dense>
                  <v-list-item v-for="(item, index) in formattedWhatYouLearn" :key="`learn-${index}`">
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-check</v-icon>
                    </template>
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                   <v-list-item v-if="!formattedWhatYouLearn.length">
                    <v-list-item-title>Не вказано</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="fill-height" elevation="2">
                <v-card-title>Вимоги до курсу</v-card-title>
                 <v-list dense>
                  <v-list-item v-for="(item, index) in formattedRequirements" :key="`req-${index}`">
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-chevron-right</v-icon>
                    </template>
                    <v-list-item-title>{{ item }}</v-list-item-title>
                  </v-list-item>
                   <v-list-item v-if="!formattedRequirements.length">
                    <v-list-item-title>Не вказано</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <!-- Права колонка (сайдбар) -->
        <v-col cols="12" md="4">
          <!-- Дії з курсом -->
          <v-card class="mb-5" elevation="2">
             <v-card-title>Керування курсом</v-card-title>
             <v-card-text>
                <v-btn block color="primary" class="mb-2" @click="$emit('edit-course', course)">
                  <v-icon left>mdi-pencil</v-icon> Редагувати
                </v-btn>
                <v-btn block color="success" class="mb-2" v-if="!course.is_published && hasModules" @click="$emit('publish-course', course)">
                  <v-icon left>mdi-bookmark</v-icon> Опублікувати
                </v-btn>
                <v-btn block color="warning" class="mb-2" v-if="course.is_published" @click="$emit('unpublish-course', course)">
                  <v-icon left>mdi-bookmark-off</v-icon> Зняти з публікації
                </v-btn>
                <v-btn block color="error" @click="$emit('delete-course', course)">
                  <v-icon left>mdi-delete</v-icon> Видалити
                </v-btn>
             </v-card-text>
          </v-card>
          
           <!-- Статистика -->
          <v-card class="mb-5" elevation="2">
            <v-card-title>Статистика</v-card-title>
            <v-list dense>
              <v-list-item v-for="stat in courseStats" :key="stat.label">
                <template v-slot:prepend>
                  <v-icon>{{ stat.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ stat.label }}: <strong>{{ stat.value }}</strong></v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
          
          <!-- Деталі курсу -->
          <v-card elevation="2">
            <v-card-title>Деталі курсу</v-card-title>
             <v-list dense>
                <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-cash</v-icon>
                    </template>
                    <v-list-item-title>Ціна</v-list-item-title>
                    <v-list-item-subtitle>{{ formattedPrice }}</v-list-item-subtitle>
                </v-list-item>
                 <v-divider></v-divider>
                 <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-account-tie</v-icon>
                    </template>
                    <v-list-item-title>Інструктор</v-list-item-title>
                    <v-list-item-subtitle>{{ instructorName }}</v-list-item-subtitle>
                </v-list-item>
                 <v-divider></v-divider>
                <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-layers</v-icon>
                    </template>
                    <v-list-item-title>Категорія</v-list-item-title>
                    <v-list-item-subtitle>{{ categoryName }}</v-list-item-subtitle>
                </v-list-item>
                 <v-divider></v-divider>
                 <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-signal</v-icon>
                    </template>
                    <v-list-item-title>Рівень</v-list-item-title>
                    <v-list-item-subtitle>{{ levelName }}</v-list-item-subtitle>
                </v-list-item>
                 <v-divider></v-divider>
                <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-translate</v-icon>
                    </template>
                    <v-list-item-title>Мова</v-list-item-title>
                    <v-list-item-subtitle>{{ course.language || 'Не вказано' }}</v-list-item-subtitle>
                </v-list-item>
             </v-list>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Модулі та уроки -->
      <v-row>
        <v-col cols="12">
            <div class="modules-section">
                <div class="section-header">
                    <h2>Модулі курсу</h2>
                    <v-btn color="primary" @click="openModuleModal()">
                    <v-icon left>mdi-plus</v-icon>
                    Додати модуль
                    </v-btn>
                </div>
                <v-progress-circular v-if="loadingModules" indeterminate color="primary"></v-progress-circular>
                <v-alert v-else-if="!hasModules" type="info" class="mt-4">
                    У цього курсу ще немає модулів. Додайте перший модуль для можливості публікації курсу.
                </v-alert>
                <div v-else class="modules-list">
                    <module-item
                        v-for="(module, index) in course.modules"
                        :key="module.id"
                        :module="module"
                        :index="index"
                        :course-id="course.id"
                        @edit-module="openModuleModal"
                        @delete-module="confirmDeleteModule"
                        @add-lesson="addLesson"
                        @edit-lesson="openLessonModal"
                        @delete-lesson="confirmDeleteLesson"
                        @view-lesson="viewLesson"
                        @lessons-loaded="handleLessonsLoaded"
                    />
                </div>
            </div>
        </v-col>
      </v-row>
    </v-container>

    <module-modal v-if="showModuleModal" :module="currentModule" :course-id="course.id" @close="closeModuleModal" @save="saveModule" />
    <lesson-extended-modal v-if="showLessonModal" :lesson="currentLesson" :module-id="currentModuleId" @close="closeLessonModal" @save="saveLesson" />
    <confirm-modal v-if="showConfirmModal" :title="confirmTitle" :message="confirmMessage" @confirm="confirmAction" @cancel="closeConfirmModal" />
    <lesson-view-modal v-if="showLessonViewModal && viewingLesson" :lesson="viewingLesson" @close="closeLessonViewModal" @edit="editFromView" />
  </div>
</template>

<script>
import api from '@/services/api.js'
import ModuleItem from './ModuleItem.vue'
import ModuleModal from './ModuleModal.vue'
import LessonExtendedModal from './LessonExtendedModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import LessonViewModal from './LessonViewModal.vue'

export default {
  name: 'CourseDetail',
  components: {
    ModuleItem,
    ModuleModal,
    LessonExtendedModal,
    ConfirmModal,
    LessonViewModal,
  },
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loadingModules: false,
      showModuleModal: false,
      showLessonModal: false,
      showConfirmModal: false,
      currentModule: null,
      currentLesson: null,
      currentModuleId: null,
      confirmTitle: '',
      confirmMessage: '',
      confirmAction: () => {},
      showLessonViewModal: false,
      viewingLesson: null,
    }
  },
  computed: {
    youtubeEmbedUrl() {
        if (!this.course.promo_video_url) return null;
        const url = this.course.promo_video_url;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length == 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        
        console.error('Не вдалося витягти ID відео з посилання:', url);
        return null;
    },
    courseStats() {
        return [
            { label: 'Модулі', value: this.course.modules_count || (this.course.modules ? this.course.modules.length : 0), icon: 'mdi-view-module' },
            { label: 'Уроки', value: this.course.lessons_count || 0, icon: 'mdi-school' },
            { label: 'Студенти', value: this.course.enrollments_count || 0, icon: 'mdi-account-group' },
            { label: 'Рейтинг', value: `${this.course.average_rating || 0} (${this.course.reviews_count || 0} відгуків)`, icon: 'mdi-star' },
        ];
    },
    categoryName() {
      return this.course.category ? this.course.category.name : ''
    },
    levelName() {
      return this.course.level ? this.course.level.name : 'Не вказано'
    },
    instructorName() {
      if (this.course.instructor) {
        return this.course.instructor.name || 'Не вказано';
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
    hasModules() {
      return this.course.modules && this.course.modules.length > 0
    },
  },
  watch: {
    course: {
      immediate: true,
      handler(newCourse) {
         if (newCourse && newCourse.id && (!newCourse.modules || newCourse.modules.length === 0)) {
           this.loadModules();
         }
      }
    }
  },
  methods: {
    async loadModules() {
      if (!this.course || !this.course.id) {
        return
      }
      this.loadingModules = true
      try {
        const response = await api.modules.getModulesByCourse(this.course.id)
        if(response.data && response.data.data) {
            this.course.modules = response.data.data;
        } else if (response.data) {
            this.course.modules = response.data;
        }
      } catch (error) {
        console.error('Помилка при завантаженні модулів:', error)
        this.course.modules = [];
      } finally {
        this.loadingModules = false
      }
    },
     handleLessonsLoaded({ moduleId, lessons }) {
      const moduleIndex = this.course.modules.findIndex((m) => m.id === moduleId)
      if (moduleIndex !== -1) {
        this.course.modules[moduleIndex].lessons = lessons;
      }
    },
    openModuleModal(module = null) {
      this.currentModule = module
      this.showModuleModal = true
    },
    closeModuleModal() {
      this.showModuleModal = false
      this.currentModule = null
    },
    async saveModule() {
      this.loadModules();
      this.closeModuleModal();
    },
    confirmDeleteModule(module) {
      this.confirmTitle = 'Видалення модуля'
      this.confirmMessage = `Ви впевнені, що хочете видалити модуль "${module.title}"?`
      this.confirmAction = () => this.deleteModule(module.id)
      this.showConfirmModal = true
    },
    async deleteModule(moduleId) {
      try {
        await api.modules.deleteModule(moduleId)
        this.loadModules();
      } catch (error) {
        console.error('Помилка при видаленні модуля:', error)
      } finally {
          this.closeConfirmModal();
      }
    },
    openLessonModal(lesson = null, module = null) {
      this.currentLesson = lesson;
      this.currentModuleId = module ? module.id : null;
      if (!this.currentModuleId && lesson && lesson.module_id) {
        this.currentModuleId = lesson.module_id;
      }
       if (!this.currentModuleId) {
         const foundModule = this.course.modules.find(m => m.lessons && m.lessons.some(l => l.id === lesson.id));
         if(foundModule) this.currentModuleId = foundModule.id;
       }
       if (!this.currentModuleId) {
        console.error("Не вдалося визначити модуль для уроку");
        return;
      }
      this.showLessonModal = true;
    },
    addLesson(lesson = null, module = null) {
      // Навігація до сторінки додавання уроку
      this.$router.push(`/admin/courses/${this.course.id}/module/${module.id}/add-lesson`);
    },
    closeLessonModal() {
      this.showLessonModal = false
      this.currentLesson = null
      this.currentModuleId = null
    },
    async saveLesson() {
      this.loadModules();
      this.closeLessonModal();
    },
    async viewLesson(lesson) {
      try {
        const response = await api.lessons.getLessonById(lesson.id)
        let lessonDetails = response.data.data || response.data.lesson || response.data;
        this.viewingLesson = { ...lesson, ...lessonDetails }
        this.showLessonViewModal = true
      } catch (error) {
        console.error('Помилка при завантаженні деталей уроку:', error)
        this.viewingLesson = lesson
        this.showLessonViewModal = true
      }
    },
    closeLessonViewModal() {
      this.showLessonViewModal = false
      this.viewingLesson = null
    },
    editFromView(lesson) {
      this.closeLessonViewModal()
      const module = this.course.modules.find(m => m.id === lesson.module_id);
      this.openLessonModal(lesson, module)
    },
     confirmDeleteLesson(lesson) {
      this.confirmTitle = 'Видалення уроку';
      this.confirmMessage = `Ви впевнені, що хочете видалити урок "${lesson.title}"?`;
      this.confirmAction = () => this.deleteLesson(lesson.id);
      this.showConfirmModal = true;
    },
    async deleteLesson(lessonId) {
        try {
            await api.lessons.deleteLesson(lessonId);
            this.loadModules(); 
        } catch (error) {
            console.error('Помилка при видаленні уроку:', error);
            alert('Не вдалося видалити урок.');
        } finally {
            this.closeConfirmModal();
        }
    },
  },
}
</script>

<style scoped>
/* Remove all banner-related styles */
.course-detail-view {
  background-color: #f5f5f5;
}

.modules-section {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modules-list {
    margin-top: 1rem;
}

.fill-height {
  height: 100%;
}
iframe {
  width: 100%;
  height: 100%;
}
</style> 