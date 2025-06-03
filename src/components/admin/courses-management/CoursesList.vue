<!-- src\components\admin\courses-management\CoursesList.vue -->
<template>
  <div class="courses-list">
    <!-- Навігаційне меню для управління курсами -->
    <div class="course-nav">
      <div class="filter-panel">
        <span class="filter-label">Категорія:</span>
        <div class="dropdown" ref="dropdown">
          <button class="dropdown-toggle" @click="toggleDropdown">
            {{ selectedCategory ? selectedCategory.name : 'Всі категорії' }}
            <v-icon>mdi-chevron-down</v-icon>
          </button>
          <div class="dropdown-menu" v-show="showDropdown">
            <!-- Опція "Всі категорії" -->
            <div class="dropdown-item all-categories" @click="setCategory(null)">
              <span class="category-name-full">Всі категорії</span>
            </div>

            <!-- Список категорій з іконками -->
            <div
              class="dropdown-item category-item"
              v-for="category in categories"
              :key="category.id"
            >
              <!-- Назва категорії (клікабельна область для вибору) -->
              <div class="category-main" @click="setCategory(category)">
                <span class="category-name">{{ category.name }}</span>
              </div>

              <!-- Іконки управління -->
              <div class="category-actions">
                <!-- Іконка редагування -->
                <button
                  class="action-icon edit-icon"
                  @click.stop="editCategory(category)"
                  :title="`Редагувати категорію '${category.name}'`"
                >
                  <v-icon size="18" color="#1976d2">mdi-pencil</v-icon>
                </button>

                <!-- Іконка видалення -->
                <button
                  class="action-icon delete-icon"
                  @click.stop="deleteCategory(category)"
                  :title="`Видалити категорію '${category.name}'`"
                >
                  <v-icon size="18" color="#d32f2f">mdi-delete</v-icon>
                </button>
              </div>
            </div>

            <!-- Опція додавання нової категорії -->
            <div class="dropdown-item add-category" @click="$emit('open-category-modal')">
              <v-icon small color="#1976d2">mdi-plus</v-icon>
              <span class="add-category-text">Додати категорію</span>
            </div>
          </div>
        </div>
      </div>

      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Пошук курсів"
          class="search-input"
          @input="handleSearch"
        />
        <v-icon class="search-icon">mdi-magnify</v-icon>
      </div>

      <button class="add-button" @click="$emit('open-course-modal')">
        <v-icon small>mdi-plus</v-icon>
        Додати курс
      </button>
    </div>

    <!-- Грід для відображення курсів -->
    <div class="courses-container">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Завантаження курсів...</p>
      </div>
      <div v-else-if="filteredCourses.length === 0" class="no-courses">
        <p>Курсів не знайдено</p>
      </div>
      <div v-else class="courses-grid">
        <course-card
          v-for="course in filteredCourses"
          :key="course.id"
          :course="course"
          @click="$emit('select-course', course)"
          @edit="$emit('edit-course', course)"
          @publish="$emit('publish-course', course)"
          @unpublish="$emit('unpublish-course', course)"
          @delete="$emit('delete-course', course)"
        />
      </div>
    </div>

    <!-- Модальне вікно підтвердження видалення -->
    <v-dialog v-model="showDeleteDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
          Підтвердження видалення
        </v-card-title>
        <v-card-text>
          <p class="mb-2">Ви впевнені, що хочете видалити категорію:</p>
          <p class="font-weight-bold text-primary">{{ categoryToDelete?.name }}</p>
          <v-alert type="warning" dense class="mt-3">
            <small>Ця дія є незворотною!</small>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="cancelDelete"> Скасувати </v-btn>
          <v-btn color="red" text @click="confirmDelete" :loading="deletingCategory">
            Видалити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CourseCard from './CourseCard.vue'
import api from '@/services/api.js'

export default {
  name: 'CoursesList',
  components: {
    CourseCard,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      courses: [],
      categories: [],
      searchQuery: '',
      selectedCategory: null,
      error: null,
      showDropdown: false,

      // Для модального вікна видалення
      showDeleteDialog: false,
      categoryToDelete: null,
      deletingCategory: false,
    }
  },
  computed: {
    filteredCourses() {
      if (!this.courses) return []

      let filtered = this.courses

      // Фільтр за категорією
      if (this.selectedCategory) {
        filtered = filtered.filter((course) => course.category_id === this.selectedCategory.id)
      }

      // Фільтр за пошуковим запитом
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (course) =>
            course.title.toLowerCase().includes(query) ||
            (course.description && course.description.toLowerCase().includes(query)) ||
            (course.category && course.category.name.toLowerCase().includes(query)),
        )
      }

      return filtered
    },
  },
  created() {
    this.fetchCategories()
    this.fetchCourses()
  },
  mounted() {
    // Закриваємо dropdown при кліку поза ним
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
      console.log('Dropdown toggled:', this.showDropdown)
    },

    handleClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    },

    async fetchCategories() {
      try {
        const response = await api.categories.getAllCategories()
        this.categories = response.data.data
        console.log('Завантажені категорії:', this.categories)
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error)
        this.error = 'Не вдалося завантажити категорії'
      }
    },

    async fetchCourses() {
      this.$emit('update:loading', true)
      try {
        if (this.selectedCategory) {
          const response = await api.courses.getCoursesByCategory(this.selectedCategory.id)
          this.courses = response.data.data
        } else {
          const response = await api.courses.getAllCourses()
          this.courses = response.data.data
        }
      } catch (error) {
        console.error('Помилка при завантаженні курсів:', error)
        this.error = 'Не вдалося завантажити курси'
      } finally {
        this.$emit('update:loading', false)
      }
    },

    handleSearch() {
      // Можна додати debounce для оптимізації
    },

    async setCategory(category) {
      console.log('Встановлення категорії:', category)
      this.selectedCategory = category
      this.showDropdown = false
      this.fetchCourses()
    },

    // Методи для роботи з категоріями
    editCategory(category) {
      console.log('Редагування категорії:', category)
      this.showDropdown = false
      this.$emit('edit-category', category)
    },

    deleteCategory(category) {
      console.log('Ініціювання видалення категорії:', category)
      this.showDropdown = false
      this.categoryToDelete = category
      this.showDeleteDialog = true
    },

    cancelDelete() {
      this.showDeleteDialog = false
      this.categoryToDelete = null
      this.deletingCategory = false
    },

    async confirmDelete() {
      if (!this.categoryToDelete) return

      this.deletingCategory = true

      try {
        console.log('Видалення категорії:', this.categoryToDelete.id)
        await api.categories.deleteCategory(this.categoryToDelete.id)

        // Оновлюємо список категорій
        await this.fetchCategories()

        // Якщо видалена категорія була вибрана, скидаємо вибір
        if (this.selectedCategory && this.selectedCategory.id === this.categoryToDelete.id) {
          this.selectedCategory = null
          this.fetchCourses()
        }

        // Показуємо повідомлення про успіх
        alert(`Категорію "${this.categoryToDelete.name}" успішно видалено!`)
      } catch (error) {
        console.error('Помилка при видаленні категорії:', error)

        let errorMessage = 'Помилка при видаленні категорії'
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        }

        alert(errorMessage)
      } finally {
        this.deletingCategory = false
        this.showDeleteDialog = false
        this.categoryToDelete = null
      }
    },
  },
}
</script>

<style scoped>
.courses-list {
  width: 100%;
}

.course-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  align-items: center;
}

.filter-panel {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  font-weight: 500;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  min-width: 200px;
  justify-content: space-between;
  transition: border-color 0.2s;
}

.dropdown-toggle:hover {
  border-color: #1976d2;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 350px;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Стилі для опції "Всі категорії" */
.all-categories {
  padding: 12px 16px;
  cursor: pointer;
}

.category-name-full {
  font-weight: 500;
  color: #333;
}

/* Стилі для категорій з іконками */
.category-item {
  padding: 8px 12px;
  min-height: 44px;
}

.category-main {
  flex: 1;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.category-name {
  font-weight: 500;
  color: #333;
}

.category-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  padding-left: 8px;
}

.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 32px;
  height: 32px;
}

.edit-icon:hover {
  background-color: rgba(25, 118, 210, 0.1);
  transform: scale(1.1);
}

.delete-icon:hover {
  background-color: rgba(211, 47, 47, 0.1);
  transform: scale(1.1);
}

/* Стилі для опції додавання */
.add-category {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  color: #1976d2;
  border-top: 2px solid #e1e1e1;
  margin-top: 5px;
  font-weight: 500;
  gap: 8px;
  cursor: pointer;
}

.add-category:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.add-category-text {
  color: #1976d2;
}

.search-container {
  position: relative;
  width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 35px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.add-button {
  display: flex;
  align-items: center;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #1565c0;
}

.courses-container {
  width: 100%;
}

.courses-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
}

.courses-grid > * {
  flex: 1 0 280px;
  max-width: calc(33.333% - 20px);
  margin-bottom: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
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

.no-courses {
  width: 100%;
  text-align: center;
  padding: 50px;
  background-color: #f0f2f5;
  border-radius: 8px;
  color: #666;
}

/* Адаптивність */
@media screen and (max-width: 1200px) {
  .courses-grid > * {
    max-width: calc(50% - 20px);
  }
}

@media screen and (max-width: 768px) {
  .courses-grid > * {
    max-width: 100%;
  }

  .course-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-panel,
  .search-container,
  .add-button {
    width: 100%;
    margin-bottom: 10px;
  }

  .add-button {
    justify-content: center;
  }

  .dropdown-menu {
    min-width: 100%;
  }
}
</style>
