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
          <label for="lesson-content">Контент уроку (опис)</label>
          <textarea
            id="lesson-content"
            v-model="form.content"
            placeholder="Введіть опис уроку"
            rows="6"
            class="form-control"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="lesson-video">Відео з YouTube (ID або повне посилання)</label>
          <input
            id="lesson-video"
            type="text"
            v-model="form.video_url"
            placeholder="Наприклад: https://www.youtube.com/watch?v=dQw4w9WgXcQ або dQw4w9WgXcQ"
            class="form-control"
          />

          <div v-if="form.video_url" class="video-preview">
            <iframe
              :src="getYouTubeEmbedUrl(form.video_url)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div class="form-group">
          <label>Прикріплені файли</label>
          <div class="attachments-container">
            <div v-for="(attachment, index) in attachments" :key="index" class="attachment-item">
              <div class="attachment-info">
                <div class="attachment-name">{{ attachment.name }}</div>
                <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
              </div>
              <button class="remove-attachment" @click="removeAttachment(index)">
                <v-icon small>mdi-close</v-icon>
              </button>
            </div>

            <label class="add-attachment">
              <v-icon left>mdi-plus</v-icon>
              Додати файл
              <input type="file" @change="handleAttachmentUpload" multiple class="file-input" />
            </label>
          </div>
          <div class="form-hint">Підтримуються PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</div>
        </div>

        <div class="form-group">
          <label for="lesson-order">Порядок відображення</label>
          <input
            id="lesson-order"
            type="number"
            v-model.number="form.order"
            placeholder="Порядковий номер уроку"
            class="form-control"
          />
          <div class="form-hint">Залиште порожнім для автоматичного присвоєння</div>
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
  name: 'LessonModal',
  props: {
    lesson: {
      type: Object,
      default: null,
    },
    courseId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      form: {
        title: '',
        content: '',
        video_url: '',
        order: null,
      },
      attachments: [],
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
      return this.form.title.trim().length > 0 && !this.errors.title
    },
  },
  created() {
    this.initForm()
  },
  methods: {
    initForm() {
      if (this.isEdit && this.lesson) {
        this.form = {
          id: this.lesson.id,
          title: this.lesson.title || '',
          content: this.lesson.content || '',
          video_url: this.lesson.video_url || '',
          order: this.lesson.order || null,
        }

        // Ініціалізація прикріплених файлів (якщо вони є)
        // Тут потрібно буде звернутись до API для отримання списку файлів
        this.fetchAttachments()
      } else {
        this.form = {
          title: '',
          content: '',
          video_url: '',
          order: null,
        }
        this.attachments = []
      }
    },

    async fetchAttachments() {
      // Заглушка - в реальному випадку тут буде запит до API
      // для отримання списку прикріплених файлів
      this.attachments = []
    },

    getYouTubeEmbedUrl(url) {
      // Отримання ID відео з YouTube-посилання
      let videoId = url

      // Якщо це повне посилання, витягуємо ID
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
          const urlObj = new URL(url)
          if (url.includes('youtube.com/watch')) {
            videoId = urlObj.searchParams.get('v')
          } else if (url.includes('youtu.be/')) {
            videoId = urlObj.pathname.split('/')[1]
          }
        } catch (e) {
          console.error('Неправильний формат URL:', e)
        }
      }

      return `https://www.youtube.com/embed/${videoId}`
    },

    handleAttachmentUpload(event) {
      const files = Array.from(event.target.files)
      if (!files.length) return

      // Додаємо нові файли до списку
      this.attachments = [...this.attachments, ...files]

      // Скидаємо значення поля input для можливості повторного вибору тих самих файлів
      event.target.value = ''
    },

    removeAttachment(index) {
      this.attachments.splice(index, 1)
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'

      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
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

    async uploadAttachments(lessonId) {
      if (!this.attachments.length) return

      // Тут буде логіка завантаження файлів на сервер
      // Заглушка - в реальному випадку тут буде запит до API
      console.log(`Завантаження ${this.attachments.length} файлів для уроку ${lessonId}`)
    },

    async saveLesson() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        let response

        if (this.isEdit) {
          await api.lessons.updateLesson(this.courseId, this.lesson.id, this.form)
          response = { data: { ...this.form, id: this.lesson.id } }
        } else {
          response = await api.lessons.createLesson(this.courseId, this.form)
        }

        // Завантажуємо прикріплені файли
        if (response && response.data && response.data.id) {
          await this.uploadAttachments(response.data.id)
        }

        this.$emit('save', response.data)
      } catch (error) {
        console.error('Помилка при збереженні уроку:', error)
        if (error.response && error.response.data) {
          const { errors } = error.response.data
          if (errors && errors.title) {
            this.errors.title = errors.title[0]
          }
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
  margin-bottom: 20px;
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

.video-preview {
  margin-top: 15px;
  height: 315px;
}

.video-preview iframe {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.attachments-container {
  border: 1px solid #e1e1e1;
  border-radius: 4px;
  padding: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.attachment-item:last-child {
  border-bottom: none;
}

.attachment-info {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.attachment-size {
  font-size: 12px;
  color: #666;
}

.remove-attachment {
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 4px;
}

.add-attachment {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px dashed #e1e1e1;
  border-radius: 4px;
  color: #443bc9;
  cursor: pointer;
  margin-top: 10px;
}

.file-input {
  display: none;
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
