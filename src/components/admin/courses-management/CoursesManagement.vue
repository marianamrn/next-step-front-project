<!-- src\components\admin\courses-management\CoursesManagement.vue -->
<template>
  <div class="courses-management">
    <!-- Відображення списку курсів, коли не вибрано конкретний курс -->
    <courses-list
      ref="coursesList"
      v-if="!selectedCourseId"
      @select-course="selectCourse"
      @open-course-modal="openCourseModal"
      @open-category-modal="openCategoryModal"
      @edit-category="openCategoryModal"
      @edit-course="openCourseModal"
      @publish-course="publishCourse"
      @unpublish-course="unpublishCourse"
      @delete-course="confirmDeleteCourse"
    />

    <!-- Відображення деталей курсу, коли вибрано конкретний курс -->
    <course-details-container
      ref="courseDetailsContainer"
      v-else
      :key="selectedCourseId + '-' + courseDetailsVersion"
      :course-id="selectedCourseId"
      @back="backToCoursesList"
      @edit-course="openCourseModal"
      @publish-course="publishCourse"
      @unpublish-course="unpublishCourse"
      @delete-course="confirmDeleteCourse"
    />

    <!-- Модальні вікна -->
    <category-modal
      v-if="showCategoryModal"
      :category="currentCategory"
      @close="closeCategoryModal"
      @save="saveCategory"
    />

    <course-modal
      v-if="showCourseModal"
      :course="currentCourse"
      :categories="categories"
      @close="closeCourseModal"
      @save="saveCourse"
    />

    <confirm-modal
      v-if="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="confirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script>
import CoursesList from './CoursesList.vue'
import CourseDetailsContainer from './CourseDetailsContainer.vue'
import CategoryModal from './CategoryModal.vue'
import CourseModal from './CourseModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import api from '@/services/api.js'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'CoursesManagement',
  components: {
    CoursesList,
    CourseDetailsContainer,
    CategoryModal,
    CourseModal,
    ConfirmModal,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    return { router, route }
  },
  data() {
    return {
      categories: [],
      selectedCourseId: null,
      showCategoryModal: false,
      showCourseModal: false,
      showConfirmModal: false,
      loading: false,

      // Тимчасові об'єкти для модальних вікон
      currentCategory: null,
      currentCourse: null,

      // Для модального вікна підтвердження
      confirmTitle: '',
      confirmMessage: '',
      confirmAction: () => {},
      courseDetailsVersion: 0, // для форсованого оновлення
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.selectedCourseId = newId
        } else if (this.selectedCourseId) {
          this.selectedCourseId = null
        }
      },
    },
  },
  created() {
    this.fetchCategories()
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await api.categories.getAllCategories()
        this.categories = response.data.data
        console.log('Завантажені категорії:', this.categories)
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error)
      }
    },

    async selectCourse(course) {
      if (!course || !course.id) {
        console.error('Некоректний курс для вибору:', course)
        return
      }
      try {
        this.loading = true
        this.selectedCourseId = course.id
        await this.router.push({
          name: 'AdminCourseDetail',
          params: { id: course.id.toString() }
        })
      } catch (error) {
        console.error('Помилка при завантаженні деталей курсу:', error)
      } finally {
        this.loading = false
      }
    },

    backToCoursesList() {
      this.selectedCourseId = null
      this.router.push({ name: 'AdminCourses' })
    },

    // МОДАЛЬНІ ВІКНА КУРСІВ
    openCourseModal(course = null) {
      if (course) {
        this.currentCourse = { ...course }
      } else {
        // Створення нового курсу
        this.currentCourse = {
          title: '',
          description: '',
          category_id: this.categories.length > 0 ? this.categories[0].id : null,
          price: 0,
          language: 'українська',
          requirements: '',
          what_you_learn: '',
          level_id: 1,
          meta_title: '',
          meta_description: '',
        }
      }
      this.showCourseModal = true
    },

    closeCourseModal() {
      this.showCourseModal = false
      this.currentCourse = null
    },

    // МОДАЛЬНІ ВІКНА КАТЕГОРІЙ
    openCategoryModal(category = null) {
      console.log('Відкриття модального вікна категорії:', category)
      this.currentCategory = category ? { ...category } : null
      this.showCategoryModal = true
    },

    closeCategoryModal() {
      this.showCategoryModal = false
      this.currentCategory = null
    },

    // ЗБЕРЕЖЕННЯ ДАНИХ КАТЕГОРІЙ
    async saveCategory(categoryData) {
      try {
        console.log('Збереження категорії:', categoryData)

        // Категорія успішно збережена через CategoryModal
        // Оновлюємо список категорій
        await this.fetchCategories()

        // Закриваємо модальне вікно
        this.closeCategoryModal()

        console.log('Категорію успішно збережено та список оновлено')
      } catch (error) {
        console.error('Помилка при збереженні категорії:', error)
        alert('Помилка при збереженні категорії. Спробуйте пізніше.')
      }
    },

    // ЗБЕРЕЖЕННЯ ДАНИХ КУРСІВ
    async saveCourse({ courseData, coverFile }) {
      try {
        const dataToSend = { ...courseData };
        delete dataToSend.cover_image;

        const numericFields = ['price', 'discount_price', 'category_id', 'level_id', 'instructor_id'];
        numericFields.forEach(field => {
          if (dataToSend[field] !== null && dataToSend[field] !== undefined) {
            dataToSend[field] = Number(dataToSend[field]);
          }
        });

        let courseId;
        if (dataToSend.id) {
          // ОНОВЛЕННЯ: використовуємо існуючий ID
          await api.courses.updateCourse(dataToSend.id, dataToSend);
          courseId = dataToSend.id;
        } else {
          // СТВОРЕННЯ: отримуємо ID з відповіді
          const response = await api.courses.createCourse(dataToSend);
          const newCourse = response.data.data;
          if (!newCourse || !newCourse.id) {
            throw new Error("Не вдалося отримати ID новоствореного курсу.");
          }
          courseId = newCourse.id;
        }

        // Завантажуємо обкладинку, якщо вона є
        if (coverFile && courseId) {
          try {
            await api.courses.uploadCourseCover(courseId, coverFile);
          } catch (coverError) {
            console.error('Помилка при завантаженні обкладинки:', coverError);
            alert('Дані курсу збережено, але не вдалося завантажити обкладинку.');
          }
        }

        // Оновлюємо списки після успішного збереження
        if (this.$refs.coursesList && this.$refs.coursesList.refreshCurrentPage) {
          await this.$refs.coursesList.refreshCurrentPage();
        }
        
        if (this.selectedCourseId === courseId && this.$refs.courseDetailsContainer && this.$refs.courseDetailsContainer.fetchCourse) {
          await this.$refs.courseDetailsContainer.fetchCourse(courseId);
          this.courseDetailsVersion++;
        }

        this.closeCourseModal();
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error);
        const errorMessage = error.response?.data?.message || 'Помилка при збереженні курсу. Спробуйте пізніше.';
        alert(errorMessage);
      }
    },

    // ПУБЛІКАЦІЯ КУРСІВ
    async publishCourse(course) {
      try {
        await api.courses.publishCourse(course.id)
        if (this.$refs.coursesList && this.$refs.coursesList.refreshCurrentPage) {
          await this.$refs.coursesList.refreshCurrentPage()
        }
        if (this.selectedCourseId === course.id && this.$refs.courseDetailsContainer && this.$refs.courseDetailsContainer.fetchCourse) {
          await this.$refs.courseDetailsContainer.fetchCourse(course.id)
          this.courseDetailsVersion++
        }
      } catch (error) {
        console.error('Помилка при публікації курсу:', error)
      }
    },

    // Метод для зняття курсу з публікації
    async unpublishCourse(course) {
      this.confirmTitle = 'Підтвердження зняття з публікації'
      this.confirmMessage = `Ви впевнені, що хочете зняти курс "${course.title}" з публікації?`
      this.confirmAction = async () => {
        try {
          await api.courses.unpublishCourse(course.id)
          if (this.$refs.coursesList && this.$refs.coursesList.refreshCurrentPage) {
            await this.$refs.coursesList.refreshCurrentPage()
          }
          if (this.selectedCourseId === course.id && this.$refs.courseDetailsContainer && this.$refs.courseDetailsContainer.fetchCourse) {
            await this.$refs.courseDetailsContainer.fetchCourse(course.id)
            this.courseDetailsVersion++
          }
          this.closeConfirmModal()
        } catch (error) {
          console.error('Помилка при знятті курсу з публікації:', error)
        }
      }
      this.showConfirmModal = true
    },

    // ВИДАЛЕННЯ КУРСІВ
    async confirmDeleteCourse(course) {
      this.confirmTitle = 'Підтвердження видалення'
      this.confirmMessage = `Ви впевнені, що хочете видалити курс "${course.title}"?`
      this.confirmAction = async () => {
        try {
          await api.courses.deleteCourse(course.id)
          if (this.$refs.coursesList && this.$refs.coursesList.refreshCurrentPage) {
            await this.$refs.coursesList.refreshCurrentPage()
          }
          if (this.selectedCourseId === course.id) {
            this.backToCoursesList()
          }
          this.closeConfirmModal()
        } catch (error) {
          console.error('Помилка при видаленні курсу:', error)
        }
      }
      this.showConfirmModal = true
    },

    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmTitle = ''
      this.confirmMessage = ''
      this.confirmAction = () => {}
    },
  }
}
</script>

<style scoped>
.courses-management {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
}

.publication-filter {
  margin-left: 15px;
  display: flex;
  align-items: center;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #443bc9;
}
</style>