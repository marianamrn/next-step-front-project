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
        module_id: this.moduleId,
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
      },
      loading: false,
    }
  },
  computed: {
    isEdit() {
      return this.lesson && this.lesson.id
    },
    isFormValid() {
      if (!this.form.title.trim()) return false
      if (this.errors.title) return false

      // Валідація для різних типів уроків
      if (this.form.type === 'lecture') {
        // Для лекції - або контент, або файл повинен бути
        if (!this.form.content && !this.fileData && !this.filePreview) return false
      } else if (this.form.type === 'test') {
        // Для тесту - якщо зовнішній, то повинен бути URL
        if (this.form.source_type === 'url' && !this.form.external_url) return false
      } else if (this.form.type === 'extra_material') {
        // Для додаткового матеріалу - залежно від типу
        if (this.form.material_type === 'text' && !this.form.material_content) return false
        if (this.form.material_type === 'url' && !this.form.material_url) return false
        if (
          ['file', 'video', 'image'].includes(this.form.material_type) &&
          !this.materialFileData &&
          !this.materialFilePreview
        )
          return false
      }

      return true
    },
  },
  created() {
    this.initForm()
  },
  methods: {
    initForm() {
      if (this.isEdit && this.lesson) {
        // Базові поля для всіх типів уроків
        this.form = {
          title: this.lesson.title || '',
          description: this.lesson.description || '',
          module_id: this.moduleId,
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
          module_id: this.moduleId,
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
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

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
    },

    handleMaterialFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

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
      this.errors.title = ''

      if (!this.form.title.trim()) {
        this.errors.title = "Назва уроку є обов'язковою"
        isValid = false
      }

      return isValid
    },

    async saveLesson() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        // Створюємо копію форми для відправки
        const formData = { ...this.form }

        // Переконаємось, що module_id є у формі
        formData.module_id = this.moduleId

        console.log('Дані форми для відправки:', formData)

        let response

        if (this.isEdit) {
          console.log('Оновлення уроку з id:', this.lesson.id)
          response = await api.lessons.updateLesson(this.lesson.id, formData)
        } else {
          console.log('Створення нового уроку для модуля:', this.moduleId)
          response = await api.lessons.createLesson(formData)
        }

        console.log('Відповідь API:', response.data)

        // Визначаємо, які дані уроку повернути
        const lessonData = response.data.data || response.data

        this.$emit('save', lessonData)
      } catch (error) {
        console.error('Помилка при збереженні уроку:', error)

        if (error.response && error.response.data) {
          const { errors } = error.response.data
          if (errors) {
            if (errors.title) {
              this.errors.title = errors.title[0]
            }

            // Додаткова обробка інших помилок, якщо потрібно
            console.log('Помилки валідації:', errors)
          }
        }

        alert('Помилка при збереженні уроку: ' + (error.response?.data?.message || error.message))
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
