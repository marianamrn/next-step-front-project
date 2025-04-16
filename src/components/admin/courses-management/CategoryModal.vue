<!-- src\components\admin\courses-management\CategoryModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Редагування категорії' : 'Нова категорія' }}</h2>
        <button class="close-button" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="category-name">Назва категорії</label>
          <input
            id="category-name"
            type="text"
            v-model="form.name"
            placeholder="Введіть назву категорії"
            class="form-control"
          />
          <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
        </div>

        <div class="form-group">
          <label for="category-description">Опис</label>
          <textarea
            id="category-description"
            v-model="form.description"
            placeholder="Опис категорії"
            rows="3"
            class="form-control"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="parent-category">Батьківська категорія</label>
          <select id="parent-category" v-model="form.parent_id" class="form-control">
            <option :value="null">Немає (головна категорія)</option>
            <option
              v-for="category in availableParentCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" @click="$emit('close')">Скасувати</button>
        <button class="save-button" @click="saveCategory" :disabled="!isFormValid || loading">
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
  name: 'CategoryModal',
  props: {
    category: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        parent_id: null,
        is_active: true,
      },
      availableParentCategories: [],
      errors: {
        name: '',
      },
      loading: false,
    }
  },
  computed: {
    isEdit() {
      return this.category && this.category.id
    },
    isFormValid() {
      return this.form.name.trim().length > 0 && !this.errors.name
    },
  },
  created() {
    this.fetchCategories()
    this.initForm()
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await api.categories.getAllCategories()
        // Фільтруємо, щоб не показувати поточну категорію та її дочірні категорії як можливі батьківські
        this.availableParentCategories = response.data.data.filter((cat) => {
          if (this.isEdit) {
            return cat.id !== this.category.id && cat.parent_id !== this.category.id
          }
          return true
        })
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error)
      }
    },

    initForm() {
      if (this.isEdit) {
        this.form = {
          id: this.category.id,
          name: this.category.name || '',
          description: this.category.description || '',
          parent_id: this.category.parent_id,
          is_active: this.category.is_active !== undefined ? this.category.is_active : true,
        }
      } else {
        this.form = {
          name: '',
          description: '',
          parent_id: null,
          is_active: true,
        }
      }
    },

    validateForm() {
      let isValid = true
      this.errors.name = ''

      if (!this.form.name.trim()) {
        this.errors.name = "Назва категорії є обов'язковою"
        isValid = false
      }

      return isValid
    },

    async saveCategory() {
      if (!this.validateForm()) return

      this.loading = true

      try {
        if (this.isEdit) {
          await api.categories.updateCategory(this.category.id, this.form)
        } else {
          await api.categories.createCategory(this.form)
        }

        this.$emit('save', this.form)
      } catch (error) {
        console.error('Помилка при збереженні категорії:', error)
        if (error.response && error.response.data) {
          const { errors } = error.response.data
          if (errors && errors.name) {
            this.errors.name = errors.name[0]
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
  min-height: 80px;
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
