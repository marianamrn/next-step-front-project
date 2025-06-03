<!-- src\components\admin\courses-management\CoursesManagement.vue -->
<template>
  <div class="courses-management">
    <!-- Відображення списку курсів, коли не вибрано конкретний курс -->
    <courses-list
      v-if="!selectedCourseId"
      :loading="loading"
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
      v-else
      ref="courseDetailsContainer"
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
      try {
        this.loading = true
        this.selectedCourseId = course.id

        // Оновлюємо URL з використанням name замість path
        this.router.push({
          name: 'AdminCourseDetail',
          params: { id: course.id },
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
    async saveCourse(courseData) {
      try {
        console.log('Дані курсу для збереження:', JSON.stringify(courseData, null, 2))

        // Переконуємося, що числові поля дійсно є числами
        const numericFields = [
          'price',
          'discount_price',
          'category_id',
          'level_id',
          'instructor_id',
        ]
        const formData = { ...courseData }

        numericFields.forEach((field) => {
          if (formData[field] !== null && formData[field] !== undefined) {
            formData[field] = Number(formData[field])
          }
        })

        if (formData.id) {
          // Редагування існуючого курсу
          console.log(`Оновлення курсу з ID: ${formData.id}`)

          // Виконуємо запит до API
          const response = await api.courses.updateCourse(formData.id, formData)
          console.log('Відповідь сервера при оновленні:', response.data)

          // Оновлюємо деталі курсу, якщо він відкритий
          if (this.selectedCourseId === formData.id) {
            const courseDetailsContainer = this.$refs.courseDetailsContainer
            if (courseDetailsContainer) {
              courseDetailsContainer.refreshCourse()
            }
          }

          // Показуємо повідомлення про успішне оновлення
          alert('Курс успішно оновлено')
        } else {
          // Створення нового курсу
          console.log('Створення нового курсу')

          // Перевіряємо наявність обов'язкових полів
          const requiredFields = ['title', 'category_id', 'price', 'level_id']
          let missingFields = []

          for (const field of requiredFields) {
            if (!formData[field]) {
              missingFields.push(field)
            }
          }

          if (missingFields.length > 0) {
            alert(`Відсутні обов'язкові поля: ${missingFields.join(', ')}`)
            return
          }

          // Виконуємо запит до API
          const response = await api.courses.createCourse(formData)
          console.log('Відповідь сервера при створенні:', response.data)

          // Показуємо повідомлення про успішне створення
          alert('Новий курс успішно створено')
        }

        // Закриваємо модальне вікно
        this.closeCourseModal()
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error)

        // Детальне логування помилки
        if (error.response) {
          console.error('Статус відповіді:', error.response.status)
          console.error('Дані відповіді:', error.response.data)

          if (error.response.data && error.response.data.errors) {
            const validationErrors = error.response.data.errors
            const errorMessages = Object.keys(validationErrors)
              .map((field) => `${field}: ${validationErrors[field].join(', ')}`)
              .join('\n')

            alert(`Помилка валідації даних:\n${errorMessages}`)
          } else if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert(`Помилка при збереженні курсу: ${error.response.status}`)
          }
        } else if (error.request) {
          console.error('Запит був зроблений, але відповідь не отримана:', error.request)
          alert('Сервер не відповідає. Перевірте підключення до мережі.')
        } else {
          console.error('Помилка при налаштуванні запиту:', error.message)
          alert(`Помилка: ${error.message}`)
        }
      }
    },

    // ПУБЛІКАЦІЯ КУРСІВ
    async publishCourse(course) {
      try {
        console.log(`Публікація курсу з ID: ${course.id}`)

        // Запит на публікацію курсу
        const response = await api.courses.publishCourse(course.id)
        console.log('Відповідь на публікацію:', response.data)

        // Показуємо повідомлення про успіх
        alert('Курс успішно опубліковано!')

        // Оновлюємо дані, якщо ми знаходимося на сторінці деталей курсу
        if (this.selectedCourseId === course.id) {
          const courseDetailsContainer = this.$refs.courseDetailsContainer
          if (courseDetailsContainer) {
            courseDetailsContainer.refreshCourse()
          }
        }
      } catch (error) {
        console.error('Помилка при публікації курсу:', error)

        // Обробка помилок
        if (error.response) {
          console.error('Статус відповіді:', error.response.status)
          console.error('Дані відповіді:', error.response.data)

          if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert('Помилка при публікації курсу. Перевірте наявність модулів і спробуйте знову.')
          }
        } else {
          alert('Помилка при публікації курсу. Перевірте підключення до мережі.')
        }
      }
    },

    // Метод для зняття курсу з публікації
    async unpublishCourse(course) {
      try {
        console.log(`Зняття з публікації курсу з ID: ${course.id}`)

        // Запит на зняття курсу з публікації
        const response = await api.courses.unpublishCourse(course.id)
        console.log('Відповідь на зняття з публікації:', response.data)

        // Показуємо повідомлення про успіх
        alert('Курс успішно знято з публікації!')

        // Оновлюємо дані, якщо ми знаходимося на сторінці деталей курсу
        if (this.selectedCourseId === course.id) {
          const courseDetailsContainer = this.$refs.courseDetailsContainer
          if (courseDetailsContainer) {
            courseDetailsContainer.refreshCourse()
          }
        }
      } catch (error) {
        console.error('Помилка при знятті курсу з публікації:', error)

        // Обробка помилок
        if (error.response) {
          console.error('Статус відповіді:', error.response.status)
          console.error('Дані відповіді:', error.response.data)

          if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert('Помилка при знятті курсу з публікації.')
          }
        } else {
          alert('Помилка при знятті курсу з публікації. Перевірте підключення до мережі.')
        }
      }
    },

    // ВИДАЛЕННЯ КУРСІВ
    confirmDeleteCourse(course) {
      this.confirmTitle = 'Видалити курс'
      this.confirmMessage = `Ви впевнені, що хочете видалити курс "${course.title}"? Ця дія є незворотною.`
      this.confirmAction = () => this.deleteCourse(course)
      this.showConfirmModal = true
    },

    async deleteCourse(course) {
      try {
        console.log(`Видалення курсу з ID: ${course.id}`)

        // Показуємо індикатор завантаження
        this.loading = true

        // Виконуємо запит до API для видалення курсу
        const response = await api.courses.deleteCourse(course.id)

        console.log('Відповідь сервера:', response.data)

        // Якщо курс був відкритий у детальному перегляді, повертаємось до списку
        if (this.selectedCourseId === course.id) {
          this.backToCoursesList()
        }

        // Закриваємо модальне вікно підтвердження
        this.closeConfirmModal()

        // Показуємо повідомлення про успішне видалення
        alert('Курс успішно видалено')
      } catch (error) {
        console.error('Помилка при видаленні курсу:', error)

        // Детальне логування помилки
        if (error.response) {
          console.error('Статус відповіді:', error.response.status)
          console.error('Дані відповіді:', error.response.data)

          if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert(`Помилка при видаленні курсу: ${error.response.status}`)
          }
        } else if (error.request) {
          console.error('Запит був зроблений, але відповідь не отримана:', error.request)
          alert('Сервер не відповідає. Перевірте підключення до мережі.')
        } else {
          console.error('Помилка при налаштуванні запиту:', error.message)
          alert(`Помилка: ${error.message}`)
        }
      } finally {
        // Прибираємо індикатор завантаження
        this.loading = false

        // Закриваємо модальне вікно підтвердження незалежно від результату
        this.closeConfirmModal()
      }
    },

    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmTitle = ''
      this.confirmMessage = ''
      this.confirmAction = () => {}
    },
  },
}
</script>

<style scoped>
.courses-management {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
}
</style>
