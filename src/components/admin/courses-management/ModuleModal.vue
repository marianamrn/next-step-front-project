<!-- src/components/admin/courses-management/ModuleModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Редагування модуля' : 'Новий модуль' }}</h2>
        <button class="close-button" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="module-title">Назва модуля</label>
          <input
            id="module-title"
            type="text"
            v-model="form.title"
            placeholder="Введіть назву модуля"
            class="form-control"
          />
          <div v-if="errors.title" class="error-message">{{ errors.title }}</div>
        </div>

        <div class="form-group">
          <label for="module-description">Опис модуля</label>
          <textarea
            id="module-description"
            v-model="form.description"
            placeholder="Введіть опис модуля"
            rows="4"
            class="form-control"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="module-position">Позиція модуля (порядковий номер)</label>
          <input
            id="module-position"
            type="number"
            v-model.number="form.position"
            placeholder="Введіть позицію модуля"
            class="form-control"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="$emit('close')">Скасувати</button>
        <button class="save-button" @click="saveModule" :disabled="!isFormValid || loading">
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
  name: 'ModuleModal',
  props: {
    module: {
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
        description: '',
        course_id: this.courseId,
        position: null,
      },
      errors: {
        title: '',
      },
      loading: false,
    }
  },
  computed: {
    isEdit() {
      return this.module && this.module.id
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
      if (this.isEdit && this.module) {
        this.form = {
          title: this.module.title || '',
          description: this.module.description || '',
          course_id: this.courseId,
          position: this.module.position || null,
        }
      } else {
        this.form = {
          title: '',
          description: '',
          course_id: this.courseId,
          position: null,
        }
      }
    },

    validateForm() {
      let isValid = true
      this.errors.title = ''

      if (!this.form.title.trim()) {
        this.errors.title = "Назва модуля є обов'язковою"
        isValid = false
      }

      return isValid
    },

    async saveModule() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        let response

        if (this.isEdit) {
          response = await api.modules.updateModule(this.module.id, this.form)
        } else {
          response = await api.modules.createModule(this.form)
        }

        this.$emit('save', response.data.data || response.data)
      } catch (error) {
        console.error('Помилка при збереженні модуля:', error)

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
  width: 500px;
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
  flex: 1;
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
  min-height: 100px;
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
