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
              @click="setCategory(category)"
            >
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>
        </div>

        <!-- Додаємо фільтр публікації -->
        <div class="publication-filter">
          <span class="filter-label">Статус:</span>
          <select v-model="publicationFilter" class="filter-select">
            <option value="all">Всі курси</option>
            <option value="published">Опубліковані</option>
            <option value="unpublished">Неопубліковані</option>
          </select>
        </div>
      </div>

      <div class="search-container">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Пошук курсів..."
          class="search-input"
        />
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
      <div v-else-if="!courses || courses.length === 0" class="no-courses">
        <p>Курсів не знайдено</p>
      </div>
      <v-row v-else>
        <v-col
          v-for="course in courses"
          :key="course.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="d-flex"
        >
          <course-card
            class="flex-grow-1"
            :course="course"
            :categories="categories"
            @click="$emit('select-course', course)"
            @edit="$emit('edit-course', course)"
            @publish="$emit('publish-course', course)"
            @unpublish="$emit('unpublish-course', course)"
            @delete="$emit('delete-course', course)"
          >
            <div class="course-category">
              {{
                course.category && course.category.name
                  ? course.category.name
                  : 'Категорія не вказана'
              }}
            </div>
            <div class="course-price">
              {{ course.price ? course.price + ' грн' : 'Ціна не вказана' }}
            </div>
          </course-card>
        </v-col>
      </v-row>
    </div>

    <!-- Пагінація -->
    <div v-if="totalPages > 1" class="pagination-container">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:modelValue="fetchCourses"
      ></v-pagination>
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
    // loading prop is removed as component handles its own loading state
  },
  data() {
    return {
      courses: [],
      categories: [],
      searchQuery: '',
      selectedCategory: null,
      publicationFilter: 'all',
      error: null,
      showDropdown: false,
      loading: false,

      // Для модального вікна видалення
      showDeleteDialog: false,
      categoryToDelete: null,
      deletingCategory: false,

      // Пагінація
      currentPage: 1,
      totalPages: 1,
      totalCourses: 0,
      itemsPerPage: 12, // Можна змінити за потреби
    }
  },
  computed: {
    // Цей computed більше не потрібен, оскільки сервер буде повертати вже відфільтровані та сторінкові дані.
    // filteredCourses() { ... } 
    // paginatedCourses() { ... }
  },
  watch: {
    // При зміні фільтрів викликаємо завантаження даних
    searchQuery() {
      this.fetchCourses(1)
    },
    selectedCategory() {
      this.fetchCourses(1)
    },
    publicationFilter() {
      this.fetchCourses(1)
    },
  },
  created() {
    this.fetchCategories()
    this.fetchCourses(this.currentPage)
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
    },

    handleClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.showDropdown = false
      }
    },

    setCategory(category) {
      this.selectedCategory = category
      this.showDropdown = false
    },

    async fetchCategories() {
      try {
        const response = await api.categories.getAllCategories()
        this.categories = response.data.data
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error)
        this.error = 'Не вдалося завантажити категорії'
      }
    },

    async fetchCourses(page = 1) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page: page,
          per_page: this.itemsPerPage,
        }
        if (this.searchQuery) {
          params.search = this.searchQuery
        }
        if (this.selectedCategory) {
          params.category_id = this.selectedCategory.id
        }
        if (this.publicationFilter !== 'all') {
          params.published = this.publicationFilter === 'published'
        }

        const response = await api.courses.getOnlyCourses(params)
        this.courses = response.data.data
        this.totalPages = response.data.meta.last_page
        this.totalCourses = response.data.meta.total
        this.currentPage = response.data.meta.current_page
      } catch (error) {
        console.error('Помилка при завантаженні курсів:', error)
        this.error = 'Не вдалося завантажити курси'
        this.courses = []
        this.totalPages = 1
        this.totalCourses = 0
      } finally {
        this.loading = false
      }
    },

    // Методи для видалення категорії
    openDeleteDialog(category) {
      this.showDeleteDialog = true
      this.categoryToDelete = category
    },

    cancelDelete() {
      this.showDeleteDialog = false
      this.categoryToDelete = null
    },

    async confirmDelete() {
      if (!this.categoryToDelete) return
      this.deletingCategory = true
      try {
        await api.categories.deleteCategory(this.categoryToDelete.id)
        this.cancelDelete()
        await this.fetchCategories() // Оновити список категорій
      } catch (error) {
        console.error('Помилка при видаленні категорії:', error)
        alert('Не вдалося видалити категорію.')
      } finally {
        this.deletingCategory = false
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
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
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

.publication-filter {
  margin-left: 15px;
  display: flex;
  align-items: center;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #443bc9;
}

.d-flex {
  display: flex;
}
.flex-grow-1 {
  flex-grow: 1;
}
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
