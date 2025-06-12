<!-- src\components\admin\courses-management\CourseDetail.vue -->
<template>
  <div class="course-detail">
    <!-- Заголовок і основна інформація -->
    <div class="course-header" :style="courseHeaderStyle">
      <div class="course-overlay"></div>
      <div class="back-button" @click="$emit('back')">
        <v-icon left>mdi-arrow-left</v-icon>
        Повернутися до списку курсів
      </div>
      <div class="course-info">
        <div class="course-category">{{ categoryName }}</div>
        <h1 class="course-title">{{ course.title }}</h1>
        <div class="course-status" :class="course.is_published ? 'published' : 'draft'">
          {{ course.is_published ? 'Опубліковано' : 'Чернетка' }}
        </div>
        <div class="course-price">{{ formattedPrice }}</div>
      </div>
      <div class="course-actions">
        <button class="edit-button" @click="$emit('edit-course', course)">
          <v-icon left size="18">mdi-pencil</v-icon>
          Редагувати курс
        </button>
        <button
          v-if="!course.is_published && hasModules"
          class="publish-button"
          @click="$emit('publish-course', course)"
        >
          <v-icon left size="18">mdi-bookmark</v-icon>
          Опублікувати курс
        </button>
        <button
          v-if="course.is_published"
          class="unpublish-button"
          @click="$emit('unpublish-course', course)"
        >
          <v-icon left size="18">mdi-bookmark-off</v-icon>
          Скасувати публікацію
        </button>
        <button class="delete-button" @click="$emit('delete-course', course)">
          <v-icon left size="18">mdi-delete</v-icon>
          Видалити курс
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Опис курсу -->
      <div class="course-description">
        <h2>Опис курсу</h2>
        <div class="description-text">{{ course.description || 'Опис відсутній' }}</div>
      </div>

      <!-- Додаткова інформація про курс -->
      <div class="course-details">
        <div class="detail-item">
          <div class="detail-label">Рівень складності:</div>
          <div class="detail-value">{{ levelName }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Мова:</div>
          <div class="detail-value">{{ course.language || 'Не вказано' }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Інструктор:</div>
          <div class="detail-value">{{ instructorName }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Що ви вивчите:</div>
          <div class="detail-value what-you-learn">
            <ul v-if="formattedWhatYouLearn.length > 0">
              <li v-for="(item, index) in formattedWhatYouLearn" :key="index">{{ item }}</li>
            </ul>
            <span v-else>Не вказано</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Вимоги:</div>
          <div class="detail-value requirements">
            <ul v-if="formattedRequirements.length > 0">
              <li v-for="(item, index) in formattedRequirements" :key="index">{{ item }}</li>
            </ul>
            <span v-else>Не вказано</span>
          </div>
        </div>
      </div>

      <!-- Список модулів і уроків -->
      <div class="modules-section">
        <div class="section-header">
          <h2>Модулі курсу</h2>
          <button class="add-module-button" @click="openModuleModal()">
            <v-icon left size="18">mdi-plus</v-icon>
            Додати модуль
          </button>
        </div>

        <div v-if="loadingModules" class="loading-container">
          <div class="spinner"></div>
          <p>Завантаження модулів...</p>
        </div>

        <div v-else-if="!hasModules" class="no-modules">
          У цього курсу ще немає модулів. Додайте перший модуль для можливості публікації курсу.
        </div>

        <div v-else class="modules-list">
          <module-item
            v-for="(module, index) in course.modules"
            :key="module.id"
            :module="module"
            :index="index"
            @edit-module="openModuleModal"
            @delete-module="confirmDeleteModule"
            @add-lesson="openLessonModal"
            @edit-lesson="openLessonModal"
            @delete-lesson="confirmDeleteLesson"
            @view-lesson="viewLesson"
            @lessons-loaded="handleLessonsLoaded"
          />
        </div>
      </div>
    </div>

    <!-- Модальні вікна -->
    <module-modal
      v-if="showModuleModal"
      :module="currentModule"
      :course-id="course.id"
      @close="closeModuleModal"
      @save="saveModule"
    />

    <lesson-extended-modal
      v-if="showLessonModal"
      :lesson="currentLesson"
      :module-id="currentModuleId"
      @close="closeLessonModal"
      @save="saveLesson"
    />

    <confirm-modal
      v-if="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="confirmAction"
      @cancel="closeConfirmModal"
    />

    <lesson-view-modal
      v-if="showLessonViewModal && viewingLesson"
      :lesson="viewingLesson"
      @close="closeLessonViewModal"
      @edit="editFromView"
    />
  </div>
</template>

<script>
import { getImageUrl } from '@/services/api.js'
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
    courseHeaderStyle() {
      if (this.course.cover_image) {
        return {
          backgroundImage: `url(${getImageUrl(this.course.cover_image)})`,
        }
      }
      return {
        backgroundColor: '#443BC9',
      }
    },
    categoryName() {
      return this.course.category ? this.course.category.name : 'Категорія не вказана'
    },
    levelName() {
      return this.course.level ? this.course.level.name : 'Не вказано'
    },
    instructorName() {
      if (this.course.instructor) {
        return (
          this.course.instructor.full_name ||
          `${this.course.instructor.first_name} ${this.course.instructor.last_name}`
        )
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
        // Якщо потрібно, можна виконати побічні ефекти тут
      }
    }
  },
  methods: {
    async loadModules() {
      if (!this.course) {
        console.error("Об'єкт курсу відсутній")
        this.loadingModules = false
        return
      }

      if (!this.course.id) {
        console.error('ID курсу відсутній:', this.course)
        this.loadingModules = false
        return
      }

      console.log('Курс для завантаження модулів:', this.course)
      console.log('ID курсу для завантаження модулів:', this.course.id, typeof this.course.id)

      this.loadingModules = true

      try {
        // Спочатку перевіряємо, чи курс уже має модулі у відповіді API
        if (this.course.modules && Array.isArray(this.course.modules)) {
          console.log('Використовуємо модулі з відповіді API курсу:', this.course.modules.length)
          return
        }

        // Якщо модулі не включені у курс, робимо окремий запит
        console.log('Модулі відсутні в даних курсу, завантажуємо окремо')

        const response = await api.modules.getModulesByCourse(this.course.id)
        console.log('Структура відповіді API модулів:', response)

        if (!response.data) {
          console.error('Відповідь API не містить поля data')
          return
        }

        if (!response.data.data && Array.isArray(response.data)) {
          // Якщо API повертає дані безпосередньо в data, а не в data.data
          this.course.modules = response.data
        } else {
          this.course.modules = response.data.data || []
        }

        console.log('Завантажені модулі:', this.course.modules)
      } catch (error) {
        console.error('Помилка при завантаженні модулів:', error)

        if (error.response) {
          console.error('Відповідь сервера:', error.response.data)
          console.error('Статус:', error.response.status)
        } else if (error.request) {
          console.error('Запит відправлено, але відповідь не отримано:', error.request)
        } else {
          console.error('Помилка запиту:', error.message)
        }

        // Просто ініціалізуємо порожнім масивом у випадку помилки
        this.course.modules = []
      } finally {
        this.loadingModules = false
      }
    },

    // Обробка завантажених уроків для конкретного модуля
    handleLessonsLoaded({ moduleId, lessons }) {
      const moduleIndex = this.course.modules.findIndex((m) => m.id === moduleId)
      if (moduleIndex !== -1) {
        this.course.modules[moduleIndex].lessons = lessons
        // Змушуємо Vue перерендерити список модулів
        this.course.modules = [...this.course.modules]
      }
    },

    // Функції для модальних вікон модулів
    openModuleModal(module = null) {
      this.currentModule = module
      this.showModuleModal = true
    },

    closeModuleModal() {
      this.showModuleModal = false
      this.currentModule = null
    },

    async saveModule(moduleData) {
      try {
        if (moduleData.id) {
          // Оновлюємо існуючий модуль у списку
          const index = this.course.modules.findIndex((m) => m.id === moduleData.id)
          if (index !== -1) {
            this.course.modules[index] = { ...this.course.modules[index], ...moduleData }
            this.course.modules = [...this.course.modules]
          }
        } else {
          // Додаємо новий модуль до списку
          await this.loadModules()
        }

        this.closeModuleModal()
      } catch (error) {
        console.error('Помилка при збереженні модуля:', error)
      }
    },

    confirmDeleteModule(module) {
      this.confirmTitle = 'Видалення модуля'
      this.confirmMessage = `Ви впевнені, що хочете видалити модуль "${module.title}"? Усі уроки цього модуля також будуть видалені.`
      this.confirmAction = () => this.deleteModule(module)
      this.showConfirmModal = true
    },

    async deleteModule(module) {
      try {
        await api.modules.deleteModule(module.id)

        // Видаляємо модуль зі списку
        this.course.modules = this.course.modules.filter((m) => m.id !== module.id)

        this.closeConfirmModal()
      } catch (error) {
        console.error('Помилка при видаленні модуля:', error)
        alert('Помилка при видаленні модуля. Спробуйте пізніше.')
      }
    },

    // Функції для модальних вікон уроків
    openLessonModal(lesson = null, module = null) {
      console.log('openLessonModal викликано з параметрами:', { lesson, module })

      // Перевіримо порядок параметрів, якщо вони переплуталися
      if (lesson && typeof lesson === 'object' && !lesson.title && module === null) {
        // Це може бути об'єкт модуля замість уроку
        if (lesson.lessons !== undefined || lesson.id) {
          console.log('Перший аргумент більше схожий на модуль, міняємо місцями')
          module = lesson
          lesson = null
        }
      }

      // Якщо досі не знайшли модуль, спробуємо знайти в поточних даних
      if (!module) {
        if (this.currentModuleId) {
          // Якщо у нас є ID поточного модуля, знайдемо його об'єкт
          const foundModule = this.course.modules.find((m) => m.id === this.currentModuleId)
          if (foundModule) {
            console.log('Використовуємо поточний модуль за ID:', foundModule)
            module = foundModule
          }
        } else {
          console.error('Модуль не передано в openLessonModal')
          alert('Необхідно вибрати модуль для уроку')
          return
        }
      }

      // Перевіримо, чи module є об'єктом і має id
      if (!module || !module.id) {
        console.error('Переданий модуль не має ID:', module)
        alert('Неправильний формат модуля')
        return
      }

      console.log('Відкриваємо модальне вікно для модуля ID:', module.id)

      this.currentLesson = lesson
      this.currentModuleId = module.id
      this.showLessonModal = true
    },

    closeLessonModal() {
      this.showLessonModal = false
      this.currentLesson = null
      this.currentModuleId = null
    },

    async saveLesson(lessonData) {
      // Оновлюємо список уроків після успішного збереження
      await this.loadModules() // або інша функція для оновлення списку уроків
      // Закриваємо модальне вікно
      this.showLessonModal = false
    },

    // Перегляд деталей уроку
    async viewLesson(lesson, module) {
      console.log('Перегляд уроку:', lesson)
      console.log('Модуль:', module)

      try {
        // Спочатку перевіряємо, чи у нас вже є всі потрібні дані в уроці
        if (
          lesson.content ||
          lesson.description ||
          lesson.video_url ||
          (lesson.lecture && lesson.lecture.content)
        ) {
          // Якщо у нас вже є основні дані, просто використовуємо їх
          this.viewingLesson = { ...lesson }
          this.currentModuleId = module.id
          this.showLessonViewModal = true
          console.log('Використовуємо існуючі дані уроку:', this.viewingLesson)
          return
        }

        // Якщо ми тут, значить нам потрібно отримати деталі уроку
        console.log('Завантаження деталей уроку:', lesson.id)
        const response = await api.lessons.getLessonById(lesson.id)

        // Обробляємо різні можливі структури відповіді
        let lessonDetails
        if (response.data && response.data.data) {
          lessonDetails = response.data.data
        } else if (response.data && response.data.lesson) {
          lessonDetails = response.data.lesson
        } else {
          lessonDetails = response.data
        }

        console.log('Деталі уроку для перегляду:', lessonDetails)

        // Зберігаємо урок для перегляду
        this.viewingLesson = { ...lesson, ...lessonDetails }
        this.currentModuleId = module.id

        // Відкриваємо модальне вікно для перегляду
        this.showLessonViewModal = true
      } catch (error) {
        console.error('Помилка при завантаженні деталей уроку:', error)

        // Навіть при помилці відкриваємо модальне вікно з тими даними, які в нас є
        this.viewingLesson = lesson
        this.currentModuleId = module.id
        this.showLessonViewModal = true

        console.warn('Відображаємо урок з обмеженими даними через помилку API')
      }
    },

    // Закриття модального вікна перегляду уроку
    closeLessonViewModal() {
      this.showLessonViewModal = false
      this.viewingLesson = null
    },

    // Редагування уроку з вікна перегляду
    editFromView(lesson) {
      // Закриваємо вікно перегляду
      this.closeLessonViewModal()

      // Знаходимо модуль, якому належить урок
      const module = this.course.modules.find(
        (m) => m.lessons && m.lessons.some((l) => l.id === lesson.id),
      )

      if (module) {
        // Відкриваємо вікно редагування
        this.openLessonModal(lesson, module)
      } else {
        console.error('Не вдалося знайти модуль для уроку:', lesson.id)
      }
    },

    confirmDeleteLesson(lesson, module) {
      this.confirmTitle = 'Видалення уроку'
      this.confirmMessage = `Ви впевнені, що хочете видалити урок "${lesson.title}"?`
      this.confirmAction = () => this.deleteLesson(lesson, module)
      this.showConfirmModal = true
    },

    async deleteLesson(lesson, module) {
      try {
        console.log('Видалення уроку:', lesson.id)

        // Видаляємо урок через API
        await api.lessons.deleteLesson(lesson.id)

        // Видаляємо урок зі списку
        const moduleIndex = this.course.modules.findIndex((m) => m.id === module.id)
        if (moduleIndex !== -1 && this.course.modules[moduleIndex].lessons) {
          this.course.modules[moduleIndex].lessons = this.course.modules[moduleIndex].lessons.filter(
            (l) => l.id !== lesson.id,
          )
          // Оновлюємо масив модулів для триггеринга оновлення Vue
          this.course.modules = [...this.course.modules]
        }

        // Закриваємо модальне вікно підтвердження
        this.closeConfirmModal()

        alert('Урок успішно видалено')
      } catch (error) {
        console.error('Помилка при видаленні уроку:', error)

        // Закриваємо модальне вікно підтвердження, навіть у випадку помилки
        this.closeConfirmModal()

        alert('Не вдалося видалити урок: ' + (error.response?.data?.message || error.message))
      }
    },

    async changePositions(moduleId, lessons) {
      try {
        // Формуємо масив з id та позиціями уроків
        const positions = lessons.map((lesson, index) => ({
          id: lesson.id,
          position: index + 1,
        }))

        console.log('Оновлення позицій уроків:', positions)

        // Відправляємо запит на оновлення позицій
        await api.lessons.updateLessonsPositions(positions)

        console.log('Позиції уроків успішно оновлено')
      } catch (error) {
        console.error('Помилка при оновленні позицій уроків:', error)
        alert(
          'Не вдалося оновити позиції уроків: ' + (error.response?.data?.message || error.message),
        )
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
.course-detail {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 70px);
}

.course-header {
  position: relative;
  color: white;
  padding: 40px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 250px;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  z-index: 2;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 15px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.course-info {
  position: relative;
  z-index: 2;
  margin-bottom: 20px;
}

.course-category {
  background-color: rgba(255, 255, 255, 0.2);
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
}

.course-title {
  font-size: 32px;
  margin: 0 0 15px 0;
  font-weight: bold;
}

.course-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
}

.published {
  background-color: #4caf50;
  color: white;
}

.draft {
  background-color: #ff9800;
  color: white;
}

.course-price {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.course-actions {
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 2;
  margin-left: auto;
}

.edit-button,
.publish-button,
.unpublish-button,
.delete-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.edit-button {
  background-color: white;
  color: #333;
}

.publish-button {
  background-color: #4caf50;
  color: white;
}

.unpublish-button {
  background-color: #ff9800;
  color: white;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.content-wrapper {
  flex: 1;
  padding: 30px;
  background-color: #f9fafb;
  overflow-y: auto;
}

.course-description,
.course-details,
.modules-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.course-description h2,
.course-details h2,
.modules-section h2 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 20px;
}

.description-text {
  white-space: pre-line;
  line-height: 1.6;
}

.detail-item {
  margin-bottom: 15px;
}

.detail-label {
  font-weight: 500;
  margin-bottom: 5px;
}

.detail-value {
  color: #555;
}

.what-you-learn ul,
.requirements ul {
  padding-left: 20px;
  margin: 0;
}

.what-you-learn li,
.requirements li {
  margin-bottom: 5px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-module-button {
  display: flex;
  align-items: center;
  background-color: #443bc9;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-weight: 500;
  cursor: pointer;
}

.add-module-button:hover {
  background-color: #3730a3;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #443bc9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-modules {
  padding: 30px;
  text-align: center;
  background-color: #f0f2f5;
  border-radius: 5px;
  color: #666;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
