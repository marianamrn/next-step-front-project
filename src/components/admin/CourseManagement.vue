<!-- src/components/admin/CourseManagement.vue -->
<template>
    <div class="course-management">
      <!-- Навігаційне меню для управління курсами -->
      <div v-if="!selectedCourse" class="course-nav">
        <div class="filter-panel">
          <span class="filter-label">Категорія:</span>
          <div class="dropdown">
            <button class="dropdown-toggle">
              {{ selectedCategory || 'Всі категорії' }}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-arrow">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu">
              <div class="dropdown-item" @click="setCategory(null)">Всі категорії</div>
              <div class="dropdown-item" v-for="category in categories" :key="category.id" @click="setCategory(category.name)">
                {{ category.name }}
              </div>
              <div class="dropdown-item add-category" @click="showAddCategoryModal = true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Додати категорію
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
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <button class="add-button" @click="addNewCourse">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Додати курс
        </button>
      </div>
  
      <!-- Грід для відображення курсів (відображається тільки якщо не вибрано курс) -->
      <div v-if="!selectedCourse" class="courses-grid">
        <div v-for="course in filteredCourses" :key="course.id" class="course-card" @click="selectCourse(course)">
          <div class="course-cover">
            <img :src="course.coverImage" :alt="course.title">
            <div class="course-status" :class="course.published ? 'published' : 'draft'">
              {{ course.published ? 'Опубліковано' : 'Чернетка' }}
            </div>
          </div>
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <div class="course-category">{{ course.category }}</div>
            <div class="course-price">{{ course.price }} грн</div>
            <div class="course-lessons">{{ course.lessons.length }} уроків</div>
          </div>
          <div class="course-actions">
            <button class="edit-button" @click.stop="editCourse(course)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
              Редагувати
            </button>
            <button v-if="!course.published && course.lessons.length > 0" class="publish-button" @click.stop="publishCourse(course)">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              Опублікувати
            </button>
          </div>
        </div>
      </div>
  
      <!-- Детальна інформація про вибраний курс -->
      <course-detail 
        v-if="selectedCourse"
        :course="selectedCourse"
        @edit-course="editCourse"
        @publish-course="publishCourse"
        @add-lesson="addNewLesson"
        @edit-lesson="editLesson"
        @publish-lesson="publishLesson"
        @delete-lesson="deleteLesson"
      />
  
      <!-- Модальне вікно для додавання/редагування курсу -->
      <div v-if="isCourseModalOpen" class="modal-overlay">
        <div class="modal-container modal-large">
          <course-form
            :course="currentCourse"
            :categories="categories"
            @close="closeCourseModal"
            @save="saveCourse"
            @publish="publishCourse"
          />
        </div>
      </div>
  
      <!-- Модальне вікно для додавання/редагування уроку -->
      <div v-if="isLessonModalOpen" class="modal-overlay">
        <div class="modal-container modal-large">
          <lesson-form
            :lesson="currentLesson"
            @close="closeLessonModal"
            @save="saveLesson"
            @publish="publishLesson"
          />
        </div>
      </div>
  
      <!-- Модальне вікно для додавання нової категорії -->
      <div v-if="showAddCategoryModal" class="modal-overlay">
        <div class="modal-container modal-small">
          <div class="modal-header">
            <h2>Додавання нової категорії</h2>
            <button class="close-button" @click="showAddCategoryModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Назва категорії</label>
              <input type="text" v-model="newCategoryName" placeholder="Введіть назву категорії">
            </div>
          </div>
          <div class="modal-footer">
            <button class="button cancel-btn" @click="showAddCategoryModal = false">Скасувати</button>
            <button class="button save-btn" @click="addCategory">Додати категорію</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import CourseDetail from './CourseDetail.vue';
  import CourseForm from './CourseForm.vue';
  import LessonForm from './LessonForm.vue';
  
  export default {
    name: 'CourseManagement',
    components: {
      CourseDetail,
      CourseForm,
      LessonForm
    },
    data() {
      return {
        searchQuery: '',
        selectedCategory: null,
        isCourseModalOpen: false,
        isLessonModalOpen: false,
        showAddCategoryModal: false,
        newCategoryName: '',
        selectedCourse: null,
        
        // Поточний курс для редагування
        currentCourse: {
          id: null,
          title: '',
          category: '',
          coverImage: null,
          description: '',
          price: 0,
          published: false,
          lessons: []
        },
        
        // Поточний урок для редагування
        currentLesson: {
          id: null,
          title: '',
          content: '',
          videoUrl: '',
          pdfUrl: '',
          formUrl: '',
          published: false
        },
        
        // Тимчасові дані для демонстрації
        categories: [
          { id: 1, name: 'Програмування' },
          { id: 2, name: 'Дизайн' },
          { id: 3, name: 'Маркетинг' },
          { id: 4, name: 'Бізнес' }
        ],
        
        courses: [
          {
            id: 1,
            title: 'Основи JavaScript',
            category: 'Програмування',
            coverImage: 'https://via.placeholder.com/300x200?text=JavaScript',
            description: 'Повний курс з основ JavaScript для початківців.',
            price: 1200,
            published: true,
            lessons: [
              {
                id: 1,
                title: 'Вступ до JavaScript',
                content: 'Основи мови JavaScript, синтаксис та особливості.',
                videoUrl: 'dQw4w9WgXcQ',
                pdfUrl: 'https://drive.google.com/file/example1',
                formUrl: 'https://forms.google.com/example1',
                published: true
              },
              {
                id: 2,
                title: 'Функції та змінні',
                content: 'Робота з функціями, змінними та областями видимості.',
                videoUrl: 'dQw4w9WgXcQ',
                pdfUrl: 'https://drive.google.com/file/example2',
                formUrl: 'https://forms.google.com/example2',
                published: true
              }
            ]
          },
          {
            id: 2,
            title: 'UI/UX Дизайн',
            category: 'Дизайн',
            coverImage: 'https://via.placeholder.com/300x200?text=UI/UX',
            description: 'Курс з дизайну інтерфейсів та досвіду користувача.',
            price: 1500,
            published: false,
            lessons: [
              {
                id: 3,
                title: 'Принципи UI дизайну',
                content: 'Основні принципи дизайну користувацьких інтерфейсів.',
                videoUrl: 'dQw4w9WgXcQ',
                pdfUrl: 'https://drive.google.com/file/example3',
                formUrl: 'https://forms.google.com/example3',
                published: false
              }
            ]
          },
          {
            id: 3,
            title: 'Основи Node.js',
            category: 'Програмування',
            coverImage: 'https://via.placeholder.com/300x200?text=Node.js',
            description: 'Вивчення Node.js для розробки серверної частини додатків.',
            price: 1800,
            published: true,
            lessons: [
              {
                id: 4,
                title: 'Установка та налаштування Node.js',
                content: 'Процес встановлення та базове налаштування середовища.',
                videoUrl: 'dQw4w9WgXcQ',
                pdfUrl: 'https://drive.google.com/file/example4',
                formUrl: 'https://forms.google.com/example4',
                published: true
              }
            ]
          },
          {
            id: 4,
            title: 'Маркетинг в соціальних мережах',
            category: 'Маркетинг',
            coverImage: 'https://via.placeholder.com/300x200?text=SMM',
            description: 'Стратегії просування в соціальних мережах.',
            price: 1300,
            published: true,
            lessons: []
          }
        ]
    }
  },
  computed: {
    filteredCourses() {
      let filtered = this.courses;
      
      // Фільтр за категорією
      if (this.selectedCategory) {
        filtered = filtered.filter(course => course.category === this.selectedCategory);
      }
      
      // Фільтр за пошуковим запитом
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  mounted() {
    // Тимчасово - дані вже завантажені в data()
    
    /* Логіка для майбутньої інтеграції з API
    this.fetchCategories();
    this.fetchCourses();
    */
  },
  methods: {
    setCategory(category) {
      this.selectedCategory = category;
    },
    
    selectCourse(course) {
      this.selectedCourse = { ...course };
    },
    
    addNewCourse() {
      // Скидаємо дані поточного курсу
      this.currentCourse = {
        id: null,
        title: '',
        category: this.categories.length > 0 ? this.categories[0].name : '',
        coverImage: null,
        description: '',
        price: 0,
        published: false,
        lessons: []
      };
      
      this.isCourseModalOpen = true;
    },
    
    editCourse(course) {
      // Копіюємо дані курсу
      this.currentCourse = JSON.parse(JSON.stringify(course));
      this.isCourseModalOpen = true;
    },
    
    closeCourseModal() {
      this.isCourseModalOpen = false;
    },
    
    saveCourse(updatedCourse) {
      if (updatedCourse.id) {
        // Оновлення існуючого курсу
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = { ...updatedCourse };
          
          // Оновлюємо selectedCourse, якщо він був вибраний
          if (this.selectedCourse && this.selectedCourse.id === updatedCourse.id) {
            this.selectedCourse = { ...updatedCourse };
          }
        }
      } else {
        // Створення нового курсу
        const newId = Math.max(0, ...this.courses.map(c => c.id)) + 1;
        const newCourse = {
          ...updatedCourse,
          id: newId
        };
        this.courses.push(newCourse);
      }
      
      this.closeCourseModal();
      
      /* Логіка для майбутньої інтеграції з API
      try {
        let response;
        
        if (updatedCourse.id) {
          // Оновлення існуючого курсу
          response = await axios.put(`/api/courses/${updatedCourse.id}`, updatedCourse);
        } else {
          // Створення нового курсу
          response = await axios.post('/api/courses', updatedCourse);
        }
        
        // Оновлюємо список курсів
        this.fetchCourses();
        
        // Якщо був вибраний курс і він був змінений, оновлюємо його
        if (this.selectedCourse && this.selectedCourse.id === response.data.id) {
          this.selectedCourse = response.data;
        }
        
        this.closeCourseModal();
      } catch (error) {
        console.error('Помилка при збереженні курсу:', error);
      }
      */
    },
    
    publishCourse(course) {
      if (course.lessons.length === 0) {
        alert('Неможливо опублікувати курс без уроків. Додайте хоча б один урок.');
        return;
      }
      
      // Публікуємо курс локально
      const index = this.courses.findIndex(c => c.id === course.id);
      if (index !== -1) {
        this.courses[index].published = true;
        
        // Оновлюємо selectedCourse, якщо він був вибраний
        if (this.selectedCourse && this.selectedCourse.id === course.id) {
          this.selectedCourse.published = true;
        }
      }
      
      /* Логіка для майбутньої інтеграції з API
      try {
        await axios.post(`/api/courses/${course.id}/publish`);
        
        // Оновлюємо дані після успішної публікації
        this.fetchCourses();
        
        // Якщо був вибраний курс і він був опублікований, оновлюємо його
        if (this.selectedCourse && this.selectedCourse.id === course.id) {
          const response = await axios.get(`/api/courses/${course.id}`);
          this.selectedCourse = response.data;
        }
      } catch (error) {
        console.error('Помилка при публікації курсу:', error);
      }
      */
    },
    
    addNewLesson() {
      if (!this.selectedCourse) {
        alert('Спочатку виберіть курс для додавання уроку.');
        return;
      }
      
      // Скидаємо дані поточного уроку
      this.currentLesson = {
        id: null,
        title: '',
        content: '',
        videoUrl: '',
        pdfUrl: '',
        formUrl: '',
        published: false
      };
      
      this.isLessonModalOpen = true;
    },
    
    editLesson(lesson) {
      // Копіюємо дані уроку
      this.currentLesson = JSON.parse(JSON.stringify(lesson));
      this.isLessonModalOpen = true;
    },
    
    closeLessonModal() {
      this.isLessonModalOpen = false;
    },
    
    saveLesson(updatedLesson) {
      if (!this.selectedCourse) {
        alert('Помилка: Курс не вибрано');
        return;
      }
      
      // Знаходимо курс, до якого належить урок
      const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
      if (courseIndex === -1) {
        alert('Помилка: Курс не знайдено');
        return;
      }
      
      if (updatedLesson.id) {
        // Оновлення існуючого уроку
        const lessonIndex = this.courses[courseIndex].lessons.findIndex(l => l.id === updatedLesson.id);
        if (lessonIndex !== -1) {
          this.courses[courseIndex].lessons[lessonIndex] = { ...updatedLesson };
          
          // Оновлюємо уроки у вибраному курсі
          this.selectedCourse.lessons = [...this.courses[courseIndex].lessons];
        }
      } else {
        // Створення нового уроку
        const newId = this.courses[courseIndex].lessons.length > 0 
          ? Math.max(...this.courses[courseIndex].lessons.map(l => l.id)) + 1 
          : 1;
          
        const newLesson = {
          ...updatedLesson,
          id: newId
        };
        
        this.courses[courseIndex].lessons.push(newLesson);
        
        // Оновлюємо уроки у вибраному курсі
        this.selectedCourse.lessons = [...this.courses[courseIndex].lessons];
      }
      
      this.closeLessonModal();
      
      /* Логіка для майбутньої інтеграції з API
      try {
        let response;
        
        if (updatedLesson.id) {
          // Оновлення існуючого уроку
          response = await axios.put(`/api/courses/${this.selectedCourse.id}/lessons/${updatedLesson.id}`, updatedLesson);
        } else {
          // Створення нового уроку
          response = await axios.post(`/api/courses/${this.selectedCourse.id}/lessons`, updatedLesson);
        }
        
        // Оновлюємо дані курсу
        const updatedCourse = await axios.get(`/api/courses/${this.selectedCourse.id}`);
        
        // Оновлюємо курс у списку
        const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
        if (courseIndex !== -1) {
          this.courses[courseIndex] = updatedCourse.data;
        }
        
        // Оновлюємо вибраний курс
        this.selectedCourse = updatedCourse.data;
        
        this.closeLessonModal();
      } catch (error) {
        console.error('Помилка при збереженні уроку:', error);
      }
      */
    },
    
    deleteLesson(lesson) {
      if (!this.selectedCourse) {
        alert('Помилка: Курс не вибрано');
        return;
      }
      
      if (!confirm('Ви впевнені, що хочете видалити цей урок? Ця дія незворотна.')) {
        return;
      }
      
      // Знаходимо курс, до якого належить урок
      const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
      if (courseIndex === -1) {
        alert('Помилка: Курс не знайдено');
        return;
      }
      
      // Видаляємо урок з курсу
      const lessonIndex = this.courses[courseIndex].lessons.findIndex(l => l.id === lesson.id);
      if (lessonIndex !== -1) {
        this.courses[courseIndex].lessons.splice(lessonIndex, 1);
        
        // Оновлюємо уроки у вибраному курсі
        this.selectedCourse.lessons = [...this.courses[courseIndex].lessons];
      }
      
      /* Логіка для майбутньої інтеграції з API
      try {
        await axios.delete(`/api/courses/${this.selectedCourse.id}/lessons/${lesson.id}`);
        
        // Оновлюємо дані курсу
        const updatedCourse = await axios.get(`/api/courses/${this.selectedCourse.id}`);
        
        // Оновлюємо курс у списку
        const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
        if (courseIndex !== -1) {
          this.courses[courseIndex] = updatedCourse.data;
        }
        
        // Оновлюємо вибраний курс
        this.selectedCourse = updatedCourse.data;
      } catch (error) {
        console.error('Помилка при видаленні уроку:', error);
      }
      */
    },
    
    publishLesson(lesson) {
      if (!this.selectedCourse) {
        alert('Помилка: Курс не вибрано');
        return;
      }
      
      // Знаходимо курс, до якого належить урок
      const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
      if (courseIndex === -1) {
        alert('Помилка: Курс не знайдено');
        return;
      }
      
      // Публікуємо урок
      const lessonIndex = this.courses[courseIndex].lessons.findIndex(l => l.id === lesson.id);
      if (lessonIndex !== -1) {
        this.courses[courseIndex].lessons[lessonIndex].published = true;
        
        // Оновлюємо уроки у вибраному курсі
        this.selectedCourse.lessons = [...this.courses[courseIndex].lessons];
      }
      
      /* Логіка для майбутньої інтеграції з API
      try {
        await axios.post(`/api/courses/${this.selectedCourse.id}/lessons/${lesson.id}/publish`);
        
        // Оновлюємо дані курсу
        const updatedCourse = await axios.get(`/api/courses/${this.selectedCourse.id}`);
        
        // Оновлюємо курс у списку
        const courseIndex = this.courses.findIndex(c => c.id === this.selectedCourse.id);
        if (courseIndex !== -1) {
          this.courses[courseIndex] = updatedCourse.data;
        }
        
        // Оновлюємо вибраний курс
        this.selectedCourse = updatedCourse.data;
      } catch (error) {
        console.error('Помилка при публікації уроку:', error);
      }
      */
    },
    
    addCategory() {
      if (!this.newCategoryName) {
        alert('Будь ласка, введіть назву категорії');
        return;
      }
      
      // Перевіряємо чи вже існує категорія з такою назвою
      const categoryExists = this.categories.some(c => c.name.toLowerCase() === this.newCategoryName.toLowerCase());
      if (categoryExists) {
        alert('Категорія з такою назвою вже існує');
        return;
      }
      
      // Додаємо нову категорію
      const newId = Math.max(0, ...this.categories.map(c => c.id)) + 1;
      this.categories.push({
        id: newId,
        name: this.newCategoryName
      });
      
      // Закриваємо модальне вікно і скидаємо поле вводу
      this.showAddCategoryModal = false;
      this.newCategoryName = '';
      
      /* Логіка для майбутньої інтеграції з API
      try {
        await axios.post('/api/categories', { name: this.newCategoryName });
        
        // Оновлюємо список категорій
        this.fetchCategories();
        
        this.showAddCategoryModal = false;
        this.newCategoryName = '';
      } catch (error) {
        console.error('Помилка при додаванні категорії:', error);
      }
      */
    },
    
    /* Логіка для майбутньої інтеграції з API
    async fetchCategories() {
      try {
        const response = await axios.get('/api/categories');
        this.categories = response.data;
      } catch (error) {
        console.error('Помилка при завантаженні категорій:', error);
      }
    },
    
    async fetchCourses() {
      try {
        const response = await axios.get('/api/courses');
        this.courses = response.data;
      } catch (error) {
        console.error('Помилка при завантаженні курсів:', error);
      }
    }
    */
  }
};
</script>

<style scoped>
.course-management {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
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
}

.dropdown-arrow {
  margin-left: 10px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 200px;
  background-color: white;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  display: none;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.add-category {
  display: flex;
  align-items: center;
  color: #443BC9;
  border-top: 1px solid #e1e1e1;
  margin-top: 5px;
}

.add-category svg {
  margin-right: 5px;
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
  background-color: #443BC9;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
}

.add-button svg {
  margin-right: 8px;
}

/* Грід для курсів */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.course-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.course-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.published {
  background-color: #4caf50;
  color: white;
}

.draft {
  background-color: #ff9800;
  color: white;
}

.course-info {
  padding: 15px;
}

.course-title {
  font-size: 18px;
  margin: 0 0 10px 0;
}

.course-category {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.course-price {
  font-weight: bold;
  margin-bottom: 5px;
}

.course-lessons {
  font-size: 14px;
  color: #666;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 15px 15px;
}

.edit-button, .publish-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #443BC9;
  cursor: pointer;
  font-size: 14px;
}

.edit-button svg, .publish-button svg {
  margin-right: 5px;
}

/* Модальні вікна */
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
  overflow-y: auto;
  max-height: 90vh;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-small {
  width: 400px;
}

.modal-large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #e1e1e1;
}

.button {
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  margin-left: 10px;
}

.cancel-btn {
  background-color: #f0f2f5;
  color: #333;
}

.save-btn {
  background-color: #443BC9;
  color: white;
}
</style>