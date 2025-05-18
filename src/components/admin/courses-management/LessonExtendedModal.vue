<!-- src/components/admin/courses-management/LessonExtendedModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Редагування уроку' : 'Новий урок' }}</h2>
        <button class="close-button" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="lesson-title">Назва уроку</label>
          <input
            id="lesson-title"
            type="text"
            v-model="form.title"
            placeholder="Введіть назву уроку"
            class="form-control"
          />
          <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
        </div>

        <div class="form-group">
          <label for="lesson-description">Опис уроку</label>
          <textarea
            id="lesson-description"
            v-model="form.description"
            placeholder="Введіть опис уроку"
            rows="3"
            class="form-control"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="lesson-type">Тип уроку</label>
          <select id="lesson-type" v-model="form.type" class="form-control" :disabled="isEdit">
            <option value="lecture">Лекція</option>
            <option value="test">Тест</option>
            <option value="extra_material">Додатковий матеріал</option>
          </select>
          <div class="form-hint">Тип уроку не можна змінити після створення</div>
        </div>

        <div class="form-group">
          <label for="lesson-position">Позиція уроку</label>
          <input
            id="lesson-position"
            type="number"
            v-model.number="form.position"
            placeholder="Введіть позицію уроку"
            class="form-control"
          />
        </div>

        <!-- Блок для типу "lecture" (лекція) -->
        <div v-if="form.type === 'lecture'" class="type-specific-fields">
          <div class="form-group">
            <label for="lecture-content">Текстовий контент лекції</label>
            <textarea
              id="lecture-content"
              v-model="form.content"
              placeholder="Введіть текстовий контент лекції"
              rows="6"
              class="form-control"
            ></textarea>
            <div v-if="errors.content" class="error-message">{{ errors.content }}</div>
          </div>

          <div class="form-group">
            <label>Або завантажте файл лекції (PDF)</label>
            <div class="file-upload">
              <div v-if="filePreview" class="file-preview">
                <div class="file-info">
                  <v-icon color="#f44336">mdi-file-pdf-box</v-icon>
                  <div class="file-name">{{ getFileName(filePreview) }}</div>
                </div>
                <button class="remove-file" @click="removeFile">
                  <v-icon small>mdi-close</v-icon>
                </button>
              </div>
              <label v-else class="upload-label">
                <v-icon size="36" color="#e1e1e1">mdi-file-upload-outline</v-icon>
                <span>Натисніть, щоб завантажити файл</span>
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept=".pdf,.doc,.docx"
                  class="file-input"
                />
              </label>
            </div>
            <div v-if="errors.file" class="error-message">{{ errors.file }}</div>
          </div>

          <div class="form-group">
            <label for="lecture-duration">Тривалість лекції (хвилин)</label>
            <input
              id="lecture-duration"
              type="number"
              v-model.number="form.duration_minutes"
              placeholder="Введіть тривалість лекції"
              class="form-control"
            />
          </div>
        </div>

        <!-- Блок для типу "test" (тест) -->
        <div v-if="form.type === 'test'" class="type-specific-fields">
          <div class="form-group">
            <label for="test-source-type">Тип джерела тесту</label>
            <select id="test-source-type" v-model="form.source_type" class="form-control">
              <option value="url">Зовнішнє посилання</option>
              <option value="internal">Внутрішній тест</option>
            </select>
          </div>

          <div v-if="form.source_type === 'url'" class="form-group">
            <label for="test-external-url">Посилання на тест</label>
            <input
              id="test-external-url"
              type="text"
              v-model="form.external_url"
              placeholder="Введіть посилання на зовнішній тест (Google Forms, тощо)"
              class="form-control"
            />
            <div v-if="errors.external_url" class="error-message">{{ errors.external_url }}</div>
          </div>

          <div class="form-group">
            <label for="test-time-limit">Обмеження часу (хвилин)</label>
            <input
              id="test-time-limit"
              type="number"
              v-model.number="form.time_limit_minutes"
              placeholder="Введіть обмеження часу"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="test-passing-score">Прохідний бал (%)</label>
            <input
              id="test-passing-score"
              type="number"
              v-model.number="form.passing_score"
              placeholder="Введіть прохідний бал"
              class="form-control"
            />
          </div>
        </div>

        <!-- Блок для типу "extra_material" (додатковий матеріал) -->
        <div v-if="form.type === 'extra_material'" class="type-specific-fields">
          <div class="form-group">
            <label for="material-type">Тип матеріалу</label>
            <select id="material-type" v-model="form.material_type" class="form-control">
              <option value="text">Текст</option>
              <option value="url">Посилання</option>
              <option value="file">Файл</option>
              <option value="video">Відео</option>
              <option value="image">Зображення</option>
            </select>
          </div>

          <div v-if="form.material_type === 'text'" class="form-group">
            <label for="material-content">Текстовий контент</label>
            <textarea
              id="material-content"
              v-model="form.material_content"
              placeholder="Введіть текстовий контент матеріалу"
              rows="6"
              class="form-control"
            ></textarea>
            <div v-if="errors.material_content" class="error-message">
              {{ errors.material_content }}
            </div>
          </div>

          <div v-if="form.material_type === 'url'" class="form-group">
            <label for="material-url">Посилання</label>
            <input
              id="material-url"
              type="text"
              v-model="form.material_url"
              placeholder="Введіть посилання на ресурс"
              class="form-control"
            />
            <div v-if="errors.material_url" class="error-message">{{ errors.material_url }}</div>
          </div>

          <div v-if="['file', 'video', 'image'].includes(form.material_type)" class="form-group">
            <label>Файл матеріалу</label>
            <div class="file-upload">
              <div v-if="materialFilePreview" class="file-preview">
                <div class="file-info">
                  <v-icon :color="getMaterialIcon(form.material_type).color">
                    {{ getMaterialIcon(form.material_type).icon }}
                  </v-icon>
                  <div class="file-name">{{ getFileName(materialFilePreview) }}</div>
                </div>
                <button class="remove-file" @click="removeMaterialFile">
                  <v-icon small>mdi-close</v-icon>
                </button>
              </div>
              <label v-else class="upload-label">
                <v-icon size="36" color="#e1e1e1">mdi-file-upload-outline</v-icon>
                <span
                  >Натисніть, щоб завантажити {{ getMaterialTypeText(form.material_type) }}</span
                >
                <input
                  type="file"
                  @change="handleMaterialFileUpload"
                  :accept="getMaterialAccept(form.material_type)"
                  class="file-input"
                />
              </label>
            </div>
            <div v-if="errors.material_file" class="error-message">{{ errors.material_file }}</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="$emit('close')">Скасувати</button>
        <button class="save-button" @click="saveLesson" :disabled="!isFormValid || loading">
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
import api from '@/services/api.js'
import axios from 'axios' // Імпортуємо axios для роботи з FormData

export default {
  name: 'LessonExtendedModal',
  props: {
    lesson: {
      type: Object,
      default: null,
    },
    moduleId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      form: {
        title: '',
        description: '',
        module_id: null,
        position: null,
        type: 'lecture',
        status: 'active',

        // Поля для лекції
        content: '',
        duration_minutes: 30,

        // Поля для тесту
        source_type: 'url',
        external_url: '',
        time_limit_minutes: 20,
        passing_score: 70,

        // Поля для додаткового матеріалу
        material_type: 'text',
        material_content: '',
        material_url: '',
      },
      fileData: null,
      filePreview: null,
      materialFileData: null,
      materialFilePreview: null,
      errors: {
        title: '',
        content: '',
        file: '',
        external_url: '',
        material_content: '',
        material_url: '',
        material_file: '',
      },
      loading: false,
    }
  },
  computed: {
    isEdit() {
      return this.lesson && this.lesson.id
    },
    isFormValid() {
      return this.validateForm()
    },
  },
  created() {
    console.log('LessonExtendedModal створено з moduleId:', this.moduleId)
    this.initForm()
  },
  methods: {
    initForm() {
      console.log('initForm викликано з moduleId:', this.moduleId)

      // Завжди встановлюємо module_id з props
      const module_id = parseInt(this.moduleId, 10)

      if (this.isEdit && this.lesson) {
        // Базові поля для всіх типів уроків
        this.form = {
          title: this.lesson.title || '',
          description: this.lesson.description || '',
          module_id: module_id,
          position: this.lesson.position || null,
          type: this.lesson.type || 'lecture',
          status: this.lesson.status || 'active',
        }

        // Додаємо специфічні поля, залежно від типу
        if (this.lesson.type === 'lecture') {
          this.form.content = this.lesson.content || ''
          this.form.duration_minutes = this.lesson.duration_minutes || 30

          if (this.lesson.file) {
            this.filePreview = this.lesson.file
          }
        } else if (this.lesson.type === 'test') {
          this.form.source_type = this.lesson.source_type || 'url'
          this.form.external_url = this.lesson.external_url || ''
          this.form.time_limit_minutes = this.lesson.time_limit_minutes || 20
          this.form.passing_score = this.lesson.passing_score || 70
        } else if (this.lesson.type === 'extra_material') {
          this.form.material_type = this.lesson.material_type || 'text'
          this.form.material_content = this.lesson.material_content || ''
          this.form.material_url = this.lesson.material_url || ''

          if (this.lesson.material_file) {
            this.materialFilePreview = this.lesson.material_file
          }
        }
      } else {
        // Новий урок - скидаємо форму до значень за замовчуванням
        this.form = {
          title: '',
          description: '',
          module_id: module_id,
          position: null,
          type: 'lecture',
          status: 'active',

          // Поля для лекції
          content: '',
          duration_minutes: 30,

          // Поля для тесту
          source_type: 'url',
          external_url: '',
          time_limit_minutes: 20,
          passing_score: 70,

          // Поля для додаткового матеріалу
          material_type: 'text',
          material_content: '',
          material_url: '',
        }
        this.fileData = null
        this.filePreview = null
        this.materialFileData = null
        this.materialFilePreview = null
      }

      console.log('Форма ініціалізована з module_id:', this.form.module_id)
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Перевірка розміру файлу (10 МБ в байтах = 10 * 1024 * 1024)
      const maxSizeBytes = 10 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        this.errors.file = `Розмір файлу перевищує 10 МБ (поточний розмір: ${(file.size / (1024 * 1024)).toFixed(2)} МБ)`
        alert(
          `Файл занадто великий. Максимальний розмір - 10 МБ, ваш файл - ${(file.size / (1024 * 1024)).toFixed(2)} МБ`,
        )
        event.target.value = '' // Скидаємо вибраний файл
        return
      }

      this.errors.file = '' // Скидаємо помилку, якщо вона була
      this.fileData = file

      // Створюємо URL для перегляду файлу
      const reader = new FileReader()
      reader.onload = (e) => {
        this.filePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },

    removeFile() {
      this.fileData = null
      this.filePreview = null
      this.errors.file = ''
    },

    handleMaterialFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Перевірка розміру файлу (10 МБ в байтах = 10 * 1024 * 1024)
      const maxSizeBytes = 10 * 1024 * 1024
      if (file.size > maxSizeBytes) {
        this.errors.material_file = `Розмір файлу перевищує 10 МБ (поточний розмір: ${(file.size / (1024 * 1024)).toFixed(2)} МБ)`
        alert(
          `Файл занадто великий. Максимальний розмір - 10 МБ, ваш файл - ${(file.size / (1024 * 1024)).toFixed(2)} МБ`,
        )
        event.target.value = '' // Скидаємо вибраний файл
        return
      }

      this.errors.material_file = '' // Скидаємо помилку, якщо вона була
      this.materialFileData = file

      // Створюємо URL для перегляду файлу
      const reader = new FileReader()
      reader.onload = (e) => {
        this.materialFilePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },

    removeMaterialFile() {
      this.materialFileData = null
      this.materialFilePreview = null
      this.errors.material_file = ''
    },

    getFileName(fileUrl) {
      if (!fileUrl) return ''

      // Якщо це URL з мережі
      if (typeof fileUrl === 'string') {
        const parts = fileUrl.split('/')
        return parts[parts.length - 1]
      }

      // Якщо це об'єкт File
      if (fileUrl.name) {
        return fileUrl.name
      }

      return 'файл'
    },

    getMaterialIcon(type) {
      const icons = {
        file: { icon: 'mdi-file-document', color: '#2196f3' },
        video: { icon: 'mdi-video', color: '#f44336' },
        image: { icon: 'mdi-image', color: '#4caf50' },
      }

      return icons[type] || { icon: 'mdi-file', color: '#666' }
    },

    getMaterialTypeText(type) {
      const texts = {
        file: 'файл',
        video: 'відео',
        image: 'зображення',
      }

      return texts[type] || 'файл'
    },

    getMaterialAccept(type) {
      const accepts = {
        file: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar',
        video: 'video/*',
        image: 'image/*',
      }

      return accepts[type] || '*/*'
    },

    validateForm() {
      let isValid = true

      // Скидаємо всі помилки
      this.errors = {
        title: '',
        content: '',
        file: '',
        external_url: '',
        material_content: '',
        material_url: '',
        material_file: '',
      }

      // Перевірка назви уроку
      if (!this.form.title || !this.form.title.trim()) {
        this.errors.title = "Назва уроку є обов'язковою"
        isValid = false
      }

      // Перевірки в залежності від типу уроку
      if (this.form.type === 'lecture') {
        // Для лекції потрібен або контент, або файл
        if (!this.form.content && !this.fileData && !this.filePreview) {
          this.errors.content = 'Додайте текст або файл'
          isValid = false
        }

        // Перевірка розміру файлу
        if (this.fileData && this.fileData.size > 10 * 1024 * 1024) {
          this.errors.file = 'Розмір файлу не повинен перевищувати 10 МБ'
          isValid = false
        }
      } else if (this.form.type === 'test') {
        // Для тесту перевіряємо наявність URL при типі 'url'
        if (this.form.source_type === 'url' && !this.form.external_url) {
          this.errors.external_url = "Посилання на тест є обов'язковим"
          isValid = false
        }
      } else if (this.form.type === 'extra_material') {
        // Для додаткового матеріалу перевіряємо в залежності від типу
        if (
          this.form.material_type === 'text' &&
          (!this.form.material_content || !this.form.material_content.trim())
        ) {
          this.errors.material_content = "Вміст матеріалу є обов'язковим"
          isValid = false
        } else if (this.form.material_type === 'url' && !this.form.material_url) {
          this.errors.material_url = "Посилання є обов'язковим"
          isValid = false
        } else if (
          ['file', 'video', 'image'].includes(this.form.material_type) &&
          !this.materialFileData &&
          !this.materialFilePreview
        ) {
          this.errors.material_file = "Файл є обов'язковим"
          isValid = false
        }

        // Перевірка розміру файлу для додаткового матеріалу
        if (this.materialFileData && this.materialFileData.size > 10 * 1024 * 1024) {
          this.errors.material_file = 'Розмір файлу не повинен перевищувати 10 МБ'
          isValid = false
        }
      }

      if (!isValid) {
        console.log('Форма не пройшла валідацію. Помилки:', this.errors)
      }

      return isValid
    },

    async saveLesson() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        // Створюємо FormData вручну для дотримання точного формату
        const formData = new FormData()

        // Додаємо базові поля для всіх типів уроків
        formData.append('title', this.form.title)
        formData.append('description', this.form.description || '')
        formData.append('module_id', this.moduleId.toString())
        formData.append('status', 'active')

        // Додаємо тип уроку
        formData.append('type', this.form.type)

        // Додаємо позицію, якщо вказана
        if (this.form.position !== null && this.form.position !== undefined) {
          formData.append('position', this.form.position.toString())
        }

        // Додаємо специфічні поля в залежності від типу уроку
        if (this.form.type === 'lecture') {
          // Для лекції
          if (this.form.content) {
            formData.append('content', this.form.content)
          }

          if (this.fileData) {
            formData.append('file', this.fileData)
          }

          formData.append('duration_minutes', (this.form.duration_minutes || 30).toString())
        } else if (this.form.type === 'test') {
          // Для тесту
          formData.append('source_type', this.form.source_type || 'url')

          if (this.form.source_type === 'url') {
            let externalUrl = this.form.external_url || ''
            if (
              externalUrl &&
              !externalUrl.startsWith('http://') &&
              !externalUrl.startsWith('https://')
            ) {
              externalUrl = 'https://' + externalUrl
            }
            formData.append('external_url', externalUrl)
          }

          formData.append('time_limit_minutes', (this.form.time_limit_minutes || 20).toString())
          formData.append('passing_score', (this.form.passing_score || 70).toString())
        } else if (this.form.type === 'extra_material') {
          // Для додаткового матеріалу
          formData.append('material_type', this.form.material_type || 'text')

          if (this.form.material_type === 'text') {
            formData.append('material_content', this.form.material_content || '')
          } else if (this.form.material_type === 'url') {
            let materialUrl = this.form.material_url || ''
            if (
              materialUrl &&
              !materialUrl.startsWith('http://') &&
              !materialUrl.startsWith('https://')
            ) {
              materialUrl = 'https://' + materialUrl
            }
            formData.append('material_url', materialUrl)
          } else if (['file', 'video', 'image'].includes(this.form.material_type)) {
            if (this.materialFileData) {
              formData.append('material_file', this.materialFileData)
            }
          }
        }

        // Логуємо всі поля для відлагодження
        console.log('FormData для створення уроку:')
        for (const pair of formData.entries()) {
          if (pair[1] instanceof File) {
            console.log(
              `${pair[0]}: File (${pair[1].name}, ${pair[1].size} bytes, ${pair[1].type})`,
            )
          } else {
            console.log(`${pair[0]}: ${pair[1]}`)
          }
        }

        // Відправляємо запит безпосередньо через API
        const response = await api.post('/lessons/manage', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        console.log('Відповідь API:', response.data)

        // Отримуємо дані створеного уроку
        const lessonData = response.data.data || response.data

        // Емітуємо подію збереження
        this.$emit('save', lessonData)
      } catch (error) {
        console.error('Повна помилка при збереженні уроку:', error)

        if (error.response) {
          console.error('Статус помилки:', error.response.status)
          console.error('Дані помилки:', error.response.data)

          if (error.response.data && error.response.data.errors) {
            const errors = error.response.data.errors
            console.error('Помилки валідації:', JSON.stringify(errors, null, 2))

            // Оновлюємо помилки в UI
            for (const field in errors) {
              if (this.errors.hasOwnProperty(field)) {
                this.errors[field] = Array.isArray(errors[field]) ? errors[field][0] : errors[field]
              }
            }

            // Формуємо повідомлення для користувача
            const errorMessages = []
            for (const field in errors) {
              const fieldMessages = Array.isArray(errors[field]) ? errors[field] : [errors[field]]
              errorMessages.push(`${field}: ${fieldMessages.join(', ')}`)
            }

            alert(`Помилки валідації:\n${errorMessages.join('\n')}`)
          } else if (error.response.data && error.response.data.message) {
            alert(`Помилка: ${error.response.data.message}`)
          } else {
            alert(`Помилка сервера: ${error.response.status}`)
          }
        } else {
          alert('Помилка при збереженні уроку. Спробуйте пізніше.')
        }
      } finally {
        this.loading = false
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
  width: 700px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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

.form-group {
  margin-bottom: 15px;
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
  min-height: 80px;
}

.form-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.type-specific-fields {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e1e1e1;
}

.file-upload {
  height: 100px;
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

.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.file-info {
  display: flex;
  align-items: center;
}

.file-name {
  margin-left: 10px;
  font-weight: 500;
}

.remove-file {
  background-color: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
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
