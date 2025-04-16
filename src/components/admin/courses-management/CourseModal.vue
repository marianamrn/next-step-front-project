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
      },
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
        }

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
        }
        this.coverPreview = null
      }
    },

    handleCoverUpload(event) {
      const file = event.target.files[0]
      if (!file) return

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

      if (!this.form.title.trim()) {
        this.errors.title = "Назва курсу є обов'язковою"
        isValid = false
      }

      return isValid
    },

    async uploadCover(courseId) {
      if (!this.coverFile) return

      try {
        await api.courses.uploadCourseCover(courseId, this.coverFile)
      } catch (error) {
        console.error('Помилка при завантаженні обкладинки:', error)
      }
    },

    async saveCourse() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        let response

        if (this.isEdit) {
          await api.courses.updateCourse(this.course.id, this.form)

          // Завантажуємо нову обкладинку, якщо вона змінилася
          if (this.coverFile) {
            await this.uploadCover(this.course.id)
          }

          response = { data: { ...this.form, id: this.course.id } }
        } else {
          response = await api.courses.createCourse(this.form)

          // Завантажуємо обкладинку для нового курсу
          if (this.coverFile && response.data && response.data.id) {
            await this.uploadCover(response.data.id)
          }
        }

        this.$emit('save', response.data)
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error)
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
