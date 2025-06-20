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
      <div v-else-if="!courses.length" class="no-courses">
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
          />
        </v-col>
      </v-row>
    </div>

    <!-- Пагінація -->
    <div v-if="pageCount > 1" class="pagination-container">
      <v-pagination
        v-model="page"
        :length="pageCount"
        :total-visible="7"
        @input="onPageChange"
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
  props: {},
  data() {
    return {
      loading: false,
      courses: [],
      categories: [],
      searchQuery: '',
      selectedCategory: null,
      publicationFilter: 'all',
      error: null,
      showDropdown: false,
      showDeleteDialog: false,
      categoryToDelete: null,
      deletingCategory: false,
      searchTimeout: null,
      // State for server-side pagination
      page: 1,
      pageCount: 0,
    }
  },
  watch: {
    selectedCategory() {
      this.fetchCourses(1);
    },
    publicationFilter() {
      this.fetchCourses(1);
    },
    searchQuery() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchCourses(1);
      }, 500);
    },
  },
  created() {
    this.fetchCategories();
    this.fetchCourses(1);
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    onPageChange(newPage) {
      this.fetchCourses(newPage);
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
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
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error)
        this.error = 'Не вдалося завантажити категорії'
      }
    },
    async fetchCourses(pageToFetch) {
      this.page = pageToFetch;
      this.loading = true;
      try {
        const params = {
          page: pageToFetch,
          per_page: 15,
        };
        
        if (this.selectedCategory) {
          params.category_id = this.selectedCategory.id;
        }
        if (this.publicationFilter !== 'all') {
          params.published = this.publicationFilter === 'published' ? 1 : 0;
        }
        if (this.searchQuery) {
          params.q = this.searchQuery;
        }
        
        console.log('Requesting courses with params:', params);
        
        const response = await api.adminCourses.getAllCourses(params);
        
        console.log('Received API response:', response);

        this.courses = response.data.data;
        this.pageCount = response.data.meta.last_page;

      } catch (error) {
        console.error('Помилка при завантаженні курсів:', error);
        this.error = 'Не вдалося завантажити курси';
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      // Debounced in watcher
    },
    async setCategory(category) {
      this.selectedCategory = category
      this.showDropdown = false
      // Watcher will trigger fetchCourses
    },
    editCategory(category) {
      this.showDropdown = false
      this.$emit('edit-category', category)
    },
    deleteCategory(category) {
      this.showDropdown = false
      this.categoryToDelete = category
      this.showDeleteDialog = true
    },
    cancelDelete() {
      this.showDeleteDialog = false
      this.categoryToDelete = null
    },
    async confirmDelete() {
      if (!this.categoryToDelete) return;
      this.deletingCategory = true;
      try {
        await api.categories.deleteCategory(this.categoryToDelete.id)
        this.fetchCategories() 
        this.cancelDelete()
      } catch (error) {
        console.error('Помилка при видаленні категорії:', error)
      } finally {
        this.deletingCategory = false
      }
    },
    refreshCurrentPage() {
      this.fetchCourses(this.page);
    },
  },
}
</script>

<style scoped>
.courses-list {
  padding: 20px;
  background-color: #f9fafb;
}

.course-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-panel {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 500;
  color: #333;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 200px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 5px;
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.category-name-full {
  font-weight: 500;
}

.category-name {
  flex-grow: 1;
}

.category-actions {
  display: flex;
  align-items: center;
}

.search-container {
  flex-grow: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.add-button {
  background-color: #443bc9;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.add-button:hover {
  background-color: #3730a3;
}

.courses-container {
  width: 100%;
}

.loading-container, .no-courses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  width: 100%;
  min-height: 300px;
  color: #666;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.publication-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #443bc9;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
.d-flex {
  display: flex;
}
.flex-grow-1 {
  flex-grow: 1;
}
</style>
