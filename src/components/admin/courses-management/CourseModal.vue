<!-- src\components\admin\courses-management\CourseModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Редагування курсу' : 'Новий курс' }}</h2>
        <button class="close-button" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-row">
          <div class="form-group col-full">
            <label for="course-title">Назва курсу</label>
            <input
              id="course-title"
              type="text"
              v-model="form.title"
              placeholder="Введіть назву курсу"
              class="form-control"
            />
            <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-half">
            <label for="course-category">Категорія</label>
            <select id="course-category" v-model="form.category_id" class="form-control">
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group col-half">
            <label for="course-level">Рівень складності</label>
            <select id="course-level" v-model="form.level_id" class="form-control">
              <option v-for="level in levels" :key="level.id" :value="level.id">
                {{ level.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Обкладинка курсу</label>
          <div class="cover-upload">
            <div v-if="coverPreview" class="cover-preview">
              <img :src="coverPreview" alt="Cover preview" />
              <button class="remove-cover" @click="removeCover">
                <v-icon>mdi-close</v-icon>
              </button>
            </div>
            <label v-else class="upload-label">
              <v-icon size="48" color="#e1e1e1">mdi-cloud-upload-outline</v-icon>
              <span>Завантажити обкладинку</span>
              <input type="file" @change="handleCoverUpload" accept="image/*" class="file-input" />
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="course-description">Опис курсу</label>
          <textarea
            id="course-description"
            v-model="form.description"
            placeholder="Введіть опис курсу"
            rows="6"
            class="form-control"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group col-half">
            <label for="course-price">Ціна курсу (грн)</label>
            <input
              id="course-price"
              type="number"
              v-model.number="form.price"
              placeholder="Введіть ціну"
              class="form-control"
            />
          </div>

          <div class="form-group col-half">
            <label for="course-language">Мова</label>
            <select id="course-language" v-model="form.language" class="form-control">
              <option value="українська">Українська</option>
              <option value="англійська">Англійська</option>
              <option value="польська">Польська</option>
              <option value="німецька">Німецька</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group col-half">
            <label for="course-promo-video">Промо-відео (YouTube URL)</label>
            <input
              id="course-promo-video"
              type="text"
              v-model="form.promo_video_url"
              placeholder="https://www.youtube.com/watch?v=..."
              class="form-control"
            />
          </div>

          <div class="form-group col-half">
            <label for="course-discount-price">Ціна зі знижкою (необов'язково)</label>
            <input
              id="course-discount-price"
              type="number"
              v-model.number="form.discount_price"
              placeholder="Введіть ціну зі знижкою"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="course-requirements">Вимоги до курсу</label>
          <textarea
            id="course-requirements"
            v-model="form.requirements"
            placeholder="Кожну вимогу з нового рядка"
            rows="3"
            class="form-control"
          ></textarea>
          <div class="form-hint">Вводьте кожну вимогу з нового рядка</div>
        </div>

        <div class="form-group">
          <label for="course-what-you-learn">Що вивчать студенти</label>
          <textarea
            id="course-what-you-learn"
            v-model="form.what_you_learn"
            placeholder="Кожен пункт з нового рядка"
            rows="3"
            class="form-control"
          ></textarea>
          <div class="form-hint">Вводьте кожний пункт з нового рядка</div>
        </div>

        <div class="form-row">
          <div class="form-group col-full">
            <label for="course-meta-title">Meta заголовок (SEO)</label>
            <input
              id="course-meta-title"
              type="text"
              v-model="form.meta_title"
              placeholder="Мета-заголовок для пошукових систем"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="course-meta-description">Meta опис (SEO)</label>
          <textarea
            id="course-meta-description"
            v-model="form.meta_description"
            placeholder="Мета-опис для пошукових систем"
            rows="2"
            class="form-control"
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="$emit('close')">Скасувати</button>
        <button class="save-button" @click="saveCourse" :disabled="!isFormValid || loading">
          <span v-if="loading">
            <v-progress-circular indeterminate size="20" width="2"></v-progress-circular>
            Збереження...
          </span>
          <span v-else>Зберегти</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/services/api.js'
import api from '@/services/api.js'

export default {
  name: 'CourseModal',
  props: {
    course: {
      type: Object,
      default: null,
    },
    categories: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        title: '',
        description: '',
        category_id: null,
        level_id: 1,
        price: 0,
        discount_price: null,
        language: 'українська',
        cover_image: null,
        promo_video_url: '',
        requirements: '',
        what_you_learn: '',
        meta_title: '',
        meta_description: '',
        is_published: false,
        instructor_id: 1,
      },
      originalForm: {}, // Для зберігання початкових даних форми
      levels: [
        { id: 1, name: 'Початковий' },
        { id: 2, name: 'Середній' },
        { id: 3, name: 'Просунутий' },
        { id: 4, name: 'Всі рівні' },
      ],
      coverFile: null,
      coverPreview: null,
      errors: {
        title: '',
      },
      loading: false,
    }
  },
  computed: {
    isEdit() {
      return this.course && this.course.id
    },
    isFormValid() {
      return this.form.title.trim().length > 0 && !this.errors.title
    },
  },
  created() {
    this.initForm()
  },
  methods: {
    initForm() {
      if (this.isEdit && this.course) {
        this.form = {
          id: this.course.id,
          title: this.course.title || '',
          description: this.course.description || '',
          category_id:
            this.course.category_id || (this.categories.length > 0 ? this.categories[0].id : null),
          level_id: this.course.level_id || 1,
          price: this.course.price || 0,
          discount_price: this.course.discount_price || null,
          language: this.course.language || 'українська',
          cover_image: this.course.cover_image || null,
          promo_video_url: this.course.promo_video_url || '',
          requirements: this.course.requirements || '',
          what_you_learn: this.course.what_you_learn || '',
          meta_title: this.course.meta_title || '',
          meta_description: this.course.meta_description || '',
          is_published: this.course.is_published || false,
          instructor_id: this.course.instructor_id || 1,
        }

        // Зберігаємо початковий стан форми для порівняння змін
        this.originalForm = { ...this.form }

        // Встановлюємо попередній перегляд обкладинки, якщо вона є
        if (this.course.cover_image) {
          this.coverPreview = getImageUrl(this.course.cover_image)
        }
      } else {
        this.form = {
          title: '',
          description: '',
          category_id: this.categories.length > 0 ? this.categories[0].id : null,
          level_id: 1,
          price: 0,
          discount_price: null,
          language: 'українська',
          cover_image: null,
          promo_video_url: '',
          requirements: '',
          what_you_learn: '',
          meta_title: '',
          meta_description: '',
          is_published: false,
          instructor_id: 1,
        }

        // Зберігаємо початковий стан форми для нового курсу
        this.originalForm = { ...this.form }

        this.coverPreview = null
      }
    },

    handleCoverUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Перевірка, чи файл є зображенням
      if (!file.type.startsWith('image/')) {
        alert('Файл обкладинки повинен бути зображенням (JPEG, PNG, GIF, тощо)')
        return
      }

      this.coverFile = file

      // Створюємо попередній перегляд обкладинки
      const reader = new FileReader()
      reader.onload = (e) => {
        this.coverPreview = e.target.result
      }
      reader.readAsDataURL(file)
    },

    removeCover() {
      this.coverFile = null
      this.coverPreview = null
      this.form.cover_image = null
    },

    validateForm() {
      let isValid = true
      this.errors.title = ''

      // Перевірка назви курсу
      if (!this.form.title || !this.form.title.trim()) {
        this.errors.title = "Назва курсу є обов'язковою"
        isValid = false
      }

      // Для нових курсів перевіряємо обов'язкові поля
      if (!this.isEdit) {
        if (!this.form.category_id) {
          alert("Категорія курсу є обов'язковою")
          isValid = false
        }

        if (!this.form.price || isNaN(parseFloat(this.form.price))) {
          alert('Ціна курсу повинна бути числовим значенням')
          isValid = false
        }

        if (!this.form.level_id) {
          alert("Рівень складності є обов'язковим")
          isValid = false
        }
      }

      // Перевірка ціни зі знижкою (якщо вказана)
      if (this.form.discount_price && isNaN(parseFloat(this.form.discount_price))) {
        alert('Ціна зі знижкою повинна бути числовим значенням')
        isValid = false
      }

      return isValid
    },

    async uploadCover(courseId) {
      if (!this.coverFile) return

      try {
        const formData = new FormData()
        formData.append('cover_image', this.coverFile)

        console.log(`Завантаження обкладинки для курсу з ID: ${courseId}`)

        await api.courses.uploadCourseCover(courseId, this.coverFile)
        console.log('Обкладинка успішно завантажена')
      } catch (error) {
        console.error('Помилка при завантаженні обкладинки:', error)
        if (error.response && error.response.data) {
          console.error('Деталі помилки:', error.response.data)
        }
        // Не перекидаємо помилку далі, щоб не блокувати збереження курсу
      }
    },

    // Метод для обробки збереження курсу (спільний вхідний метод)
    async saveCourse() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        if (this.isEdit) {
          // Якщо це редагування, викликаємо метод оновлення
          await this.updateExistingCourse()
        } else {
          // Якщо це нове створення, викликаємо метод створення
          await this.createNewCourse()
        }
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error)
        this.handleError(error)
      } finally {
        this.loading = false
      }
    },

    // Метод для створення нового курсу
    async createNewCourse() {
      // Клонуємо об'єкт форми
      const formData = { ...this.form }

      // Переконуємося, що числові поля є числами
      this.convertNumericFields(formData)

      // Перевіряємо обов'язкові поля
      const requiredFields = ['title', 'category_id', 'price', 'level_id']
      const missingFields = this.checkRequiredFields(formData, requiredFields)

      if (missingFields.length > 0) {
        alert(`Відсутні обов'язкові поля: ${missingFields.join(', ')}`)
        return
      }

      console.log('Створення нового курсу з даними:', JSON.stringify(formData, null, 2))

      // Відправляємо запит на створення курсу
      const response = await api.courses.createCourse(formData)
      console.log('Відповідь на створення курсу:', response.data)

      // Якщо є обкладинка і курс успішно створено
      if (this.coverFile && response.data && response.data.id) {
        try {
          await this.uploadCover(response.data.id)
        } catch (coverError) {
          console.error('Помилка при завантаженні обкладинки:', coverError)
          // Продовжуємо, навіть якщо обкладинка не завантажилась
        }
      }

      alert('Курс успішно створено!')
      this.$emit('save', response.data)
    },

    // Метод для оновлення існуючого курсу
    async updateExistingCourse() {
      const courseId = this.course.id

      // Визначаємо, які поля були змінені
      const changedFields = {}

      // Порівнюємо значення полів з початковими
      for (const [key, value] of Object.entries(this.form)) {
        if (JSON.stringify(this.originalForm[key]) !== JSON.stringify(value)) {
          changedFields[key] = value
        }
      }

      console.log('Оновлення полів курсу:', JSON.stringify(changedFields, null, 2))

      // Якщо немає змінених полів (крім обкладинки)
      if (Object.keys(changedFields).length === 0 && !this.coverFile) {
        alert('Немає змін для збереження')
        return
      }

      // Переконуємося, що числові поля є числами
      this.convertNumericFields(changedFields)

      // Додаємо ID курсу до даних
      changedFields.id = courseId

      // Відправляємо запит на оновлення курсу тільки зі зміненими полями
      try {
        await api.courses.updateCourse(courseId, changedFields)

        // Обробляємо обкладинку окремо, тільки якщо вона змінилась
        if (this.coverFile) {
          try {
            await this.uploadCover(courseId)
          } catch (coverError) {
            console.error('Помилка при завантаженні обкладинки:', coverError)
            // Продовжуємо виконання, навіть якщо обкладинка не завантажилась
          }
        }

        // Отримуємо оновлені дані курсу
        const updatedCourseResponse = await api.courses.getCourseById(courseId)

        alert('Курс успішно оновлено!')
        this.$emit('save', updatedCourseResponse.data.data)
      } catch (error) {
        throw error // Перекидаємо помилку для обробки у вищому методі
      }
    },

    // Метод для конвертації числових полів
    convertNumericFields(data) {
      const numericFields = ['price', 'discount_price', 'category_id', 'level_id', 'instructor_id']

      for (const field of numericFields) {
        if (data[field] !== undefined && data[field] !== null) {
          data[field] = Number(data[field])
        }
      }
    },

    // Метод для перевірки обов'язкових полів
    checkRequiredFields(data, requiredFields) {
      const missingFields = []

      for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          missingFields.push(field)
        }
      }

      return missingFields
    },

    // Метод для обробки помилок
    handleError(error) {
      if (error.response) {
        console.error('Статус відповіді:', error.response.status)
        console.error('Дані відповіді:', error.response.data)

        if (error.response.data && error.response.data.errors) {
          const validationErrors = error.response.data.errors
          console.error('Помилки валідації:', validationErrors)

          let errorMessage = 'Помилки валідації:\n'
          for (const field in validationErrors) {
            if (field === 'title') {
              this.errors.title = validationErrors[field][0]
            }
            errorMessage += `${field}: ${validationErrors[field].join(', ')}\n`
          }

          alert(errorMessage)
        } else if (error.response.data && error.response.data.message) {
          alert(`Помилка: ${error.response.data.message}`)
        }
      } else if (error.request) {
        console.error('Запит був зроблений, але відповідь не отримана:', error.request)
        alert('Сервер не відповідає. Перевірте підключення до мережі.')
      } else {
        console.error('Помилка при налаштуванні запиту:', error.message)
        alert(`Помилка: ${error.message}`)
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #e1e1e1;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #666;
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.col-full {
  width: 100%;
}

.col-half {
  width: calc(50% - 8px);
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  resize: vertical;
}

.form-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.cover-upload {
  height: 200px;
  border: 2px dashed #e1e1e1;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.upload-label span {
  margin-top: 10px;
  color: #666;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.cover-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-cover {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e1e1e1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button,
.save-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.cancel-button {
  background-color: #f0f2f5;
  color: #333;
}

.save-button {
  background-color: #443bc9;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-button:disabled {
  background-color: #b3b3cc;
  cursor: not-allowed;
}
</style>
