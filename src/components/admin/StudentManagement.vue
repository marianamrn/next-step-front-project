<!-- src/components/admin/StudentManagement.vue -->
<template>
    <div class="student-management">
      <!-- Вкладки навігації -->
      <div class="tab-navigation">
        <div 
          class="tab" 
          :class="{ active: activeTab === 'students' }" 
          @click="setActiveTab('students')"
        >
          Студенти
        </div>
        <div 
          class="tab" 
          :class="{ active: activeTab === 'requests' }" 
          @click="setActiveTab('requests')"
        >
          Запити 
          <span v-if="requests.length > 0" class="request-badge">{{ requests.length }}</span>
        </div>
      </div>
  
      <!-- Панель пошуку -->
      <div class="search-panel">
        <div v-if="activeTab === 'requests'" class="filter-panel">
          <span class="filter-label">Запити:</span>
          <div class="dropdown">
            <button class="dropdown-toggle">
              {{ selectedFilter }}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-arrow">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu">
              <div class="dropdown-item" @click="setFilter('Всі')">Всі</div>
              <div class="dropdown-item" @click="setFilter('Перевірка оплати')">Перевірка оплати</div>
              <div class="dropdown-item" @click="setFilter('Доступно')">Доступно</div>
            </div>
          </div>
        </div>
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="activeTab === 'students' ? 'Пошук (номер)' : 'Пошук'" 
            class="search-input"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
  
      <!-- Таблиця студентів -->
      <div v-if="activeTab === 'students'" class="data-table">
        <div class="table-header">
          <div class="header-cell col-id">ID</div>
          <div class="header-cell col-name">Ім'я</div>
          <div class="header-cell col-surname">Прізвище</div>
          <div class="header-cell col-email">Email</div>
          <div class="header-cell col-country">Код країни</div>
          <div class="header-cell col-phone">Номер телефону</div>
          <div class="header-cell col-actions">Дії</div>
        </div>
        <div class="table-body">
          <div v-for="student in filteredStudents" :key="student.id" class="table-row">
            <div class="cell col-id">{{ student.id }}</div>
            <div class="cell col-name">{{ student.firstName }}</div>
            <div class="cell col-surname">{{ student.lastName }}</div>
            <div class="cell col-email">{{ student.email }}</div>
            <div class="cell col-country">{{ student.countryCode }}</div>
            <div class="cell col-phone">{{ student.phone }}</div>
            <div class="cell col-actions">
              <button class="action-button view" @click="viewStudent(student)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="action-button edit" @click="editStudent(student)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Таблиця запитів -->
      <div v-if="activeTab === 'requests'" class="data-table">
        <div class="table-header">
          <div class="header-cell col-id">ID</div>
          <div class="header-cell col-name">Ім'я</div>
          <div class="header-cell col-surname">Прізвище</div>
          <div class="header-cell col-email">Email</div>
          <div class="header-cell col-phone">Номер телефону</div>
          <div class="header-cell col-type">Тип</div>
          <div class="header-cell col-actions">Дії</div>
        </div>
        <div class="table-body">
          <div v-for="request in filteredRequests" :key="request.id" class="table-row">
            <div class="cell col-id">{{ request.id }}</div>
            <div class="cell col-name">{{ request.firstName }}</div>
            <div class="cell col-surname">{{ request.lastName }}</div>
            <div class="cell col-email">{{ request.email }}</div>
            <div class="cell col-phone">{{ request.phone }}</div>
            <div class="cell col-type">{{ request.type }}</div>
            <div class="cell col-actions">
              <button class="action-button view" @click="viewRequest(request)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="action-button approve" @click="approveRequest(request)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <button class="action-button reject" @click="rejectRequest(request)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Модальне вікно перегляду студента -->
      <div v-if="isViewModalOpen" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Перегляд студента</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Ім'я</label>
              <input type="text" v-model="currentStudent.firstName" disabled>
            </div>
            <div class="form-group">
              <label>Прізвище</label>
              <input type="text" v-model="currentStudent.lastName" disabled>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="currentStudent.email" disabled>
            </div>
            <div class="form-group">
              <label>Номер телефону</label>
              <input type="text" v-model="currentStudent.phone" disabled>
            </div>
          </div>
          <div class="modal-footer">
            <button class="button close-btn" @click="closeModal">Закрити</button>
          </div>
        </div>
      </div>
  
      <!-- Модальне вікно редагування студента -->
      <div v-if="isEditModalOpen" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Редагування студента</h2>
            <button class="close-button" @click="closeModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Ім'я</label>
              <input type="text" v-model="currentStudent.firstName">
            </div>
            <div class="form-group">
              <label>Прізвище</label>
              <input type="text" v-model="currentStudent.lastName">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="currentStudent.email">
            </div>
            <div class="form-group">
              <label>Номер телефону</label>
              <input type="text" v-model="currentStudent.phone">
            </div>
          </div>
          <div class="modal-footer">
            <button class="button cancel-btn" @click="closeModal">Скасувати</button>
            <button class="button save-btn" @click="saveStudent">Змінити</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StudentManagement',
    data() {
      return {
        activeTab: 'students',
        searchQuery: '',
        selectedFilter: 'Всі',
        isViewModalOpen: false,
        isEditModalOpen: false,
        currentStudent: {
          id: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: ''
        },
        
        // Тимчасові дані для відображення
        students: [
          { id: '001', firstName: 'Галина', lastName: 'Онопко', email: 'onopko@gmail.com', countryCode: '+380', phone: '0665035153' },
          { id: '002', firstName: 'Ярослав', lastName: 'Онопко', email: 'onopko@gmail.com', countryCode: '+380', phone: '0665035153' },
          { id: '003', firstName: 'Олександр', lastName: 'Стрельник', email: 'zigaChel234@gmail.com', countryCode: '+380', phone: '0665035153' }
        ],
        requests: [
          { id: '001', firstName: 'Онопко', lastName: 'Онопко', email: 'onop24622@gmail.com', phone: '+380 665035153', type: 'Перевірка оплати' },
          { id: '002', firstName: 'Онопко', lastName: 'Онопко', email: 'onop24622@gmail.com', phone: '+380 665035153', type: 'Доступно' },
          { id: '003', firstName: 'Онопко', lastName: 'Онопко', email: 'onop24622@gmail.com', phone: '+380 665035153', type: 'Перевірка оплати' },
          { id: '004', firstName: 'Онопко', lastName: 'Онопко', email: 'onop24622@gmail.com', phone: '+380 665035153', type: 'Перевірка оплати' },
          { id: '005', firstName: 'Онопко', lastName: 'Онопко', email: 'onop24622@gmail.com', phone: '+380 665035153', type: 'Перевірка оплати' }
        ]
    }
  },
  computed: {
    filteredStudents() {
      if (!this.searchQuery) return this.students;
      
      const query = this.searchQuery.toLowerCase();
      return this.students.filter(student => 
        student.id.toLowerCase().includes(query) ||
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query)
      );
    },
    filteredRequests() {
      let filtered = this.requests;
      
      // Фільтр за типом
      if (this.selectedFilter !== 'Всі') {
        filtered = filtered.filter(req => req.type === this.selectedFilter);
      }
      
      // Фільтр за пошуковим запитом
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(req => 
          req.id.toLowerCase().includes(query) ||
          req.firstName.toLowerCase().includes(query) ||
          req.lastName.toLowerCase().includes(query) ||
          req.email.toLowerCase().includes(query) ||
          req.phone.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  mounted() {
    // Тимчасово - дані вже завантажені в data()
    
    /* Логіка для майбутньої інтеграції з API
    this.fetchStudents();
    this.fetchRequests();
    */
  },
  methods: {
    setActiveTab(tab) {
      this.activeTab = tab;
      this.searchQuery = '';
    },
    setFilter(filter) {
      this.selectedFilter = filter;
    },
    viewStudent(student) {
      this.currentStudent = { ...student };
      this.isViewModalOpen = true;
    },
    editStudent(student) {
      this.currentStudent = { ...student };
      this.isEditModalOpen = true;
    },
    closeModal() {
      this.isViewModalOpen = false;
      this.isEditModalOpen = false;
    },
    saveStudent() {
      // Тимчасово - зберігаємо зміни локально
      const index = this.students.findIndex(s => s.id === this.currentStudent.id);
      if (index !== -1) {
        this.students[index] = { ...this.currentStudent };
      }
      this.closeModal();
      
      /* Логіка для майбутньої інтеграції з API
      try {
        // Запит до API для оновлення даних студента
        // const response = await axios.put(`/api/students/${this.currentStudent.id}`, this.currentStudent);
        // if (response.status === 200) {
        //   const index = this.students.findIndex(s => s.id === this.currentStudent.id);
        //   if (index !== -1) {
        //     this.students[index] = { ...response.data };
        //   }
        //   this.closeModal();
        // }
      } catch (error) {
        console.error('Помилка при оновленні даних студента:', error);
        // Тут можна додати повідомлення про помилку для користувача
      }
      */
    },
    viewRequest(request) {
      // Тимчасово - показуємо дані запиту
      this.currentStudent = { 
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        phone: request.phone
      };
      this.isViewModalOpen = true;
      
      /* Логіка для майбутньої інтеграції з API
      try {
        // Запит до API для отримання деталей запиту
        // const response = await axios.get(`/api/requests/${request.id}`);
        // this.currentStudent = response.data;
        // this.isViewModalOpen = true;
      } catch (error) {
        console.error('Помилка при завантаженні деталей запиту:', error);
        // Тут можна додати повідомлення про помилку для користувача
      }
      */
    },
    approveRequest(request) {
      // Тимчасово - видаляємо запит зі списку
      const index = this.requests.findIndex(r => r.id === request.id);
      if (index !== -1) {
        this.requests.splice(index, 1);
      }
      
      /* Логіка для майбутньої інтеграції з API
      try {
        // Запит до API для схвалення запиту
        // await axios.post(`/api/requests/${request.id}/approve`);
        // Видаляємо запит зі списку після успішного схвалення
        // const index = this.requests.findIndex(r => r.id === request.id);
        // if (index !== -1) {
        //   this.requests.splice(index, 1);
        // }
      } catch (error) {
        console.error('Помилка при схваленні запиту:', error);
        // Тут можна додати повідомлення про помилку для користувача
      }
      */
    },
    rejectRequest(request) {
      // Тимчасово - видаляємо запит зі списку
      const index = this.requests.findIndex(r => r.id === request.id);
      if (index !== -1) {
        this.requests.splice(index, 1);
      }
      
      /* Логіка для майбутньої інтеграції з API
      try {
        // Запит до API для відхилення запиту
        // await axios.post(`/api/requests/${request.id}/reject`);
        // Видаляємо запит зі списку після успішного відхилення
        // const index = this.requests.findIndex(r => r.id === request.id);
        // if (index !== -1) {
        //   this.requests.splice(index, 1);
        // }
      } catch (error) {
        console.error('Помилка при відхиленні запиту:', error);
        // Тут можна додати повідомлення про помилку для користувача
      }
      */
    },
    /* Логіка для майбутньої інтеграції з API
    async fetchStudents() {
      try {
        // Запит до API для отримання списку студентів
        // const response = await axios.get('/api/students');
        // this.students = response.data;
      } catch (error) {
        console.error('Помилка при завантаженні списку студентів:', error);
        // Тут можна додати повідомлення про помилку для користувача
      }
    },
    async fetchRequests() {
      try {
        // Запит до API для отримання списку запитів
        // const response = await axios.get('/api/requests');
        // this.requests = response.data;
      } catch (error) {
        console.error('Помилка при завантаженні списку запитів:', error);
        // Тут можна додати повідомлення про помилку для користувача
      }
    }
    */
  }
};
</script>

<style scoped>
.student-management {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
}

.tab-navigation {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e1e1e1;
}

.tab {
  padding: 12px 24px;
  cursor: pointer;
  position: relative;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.tab.active {
  color: #443BC9;
  border-bottom: 2px solid #443BC9;
}

.request-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #443BC9;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 8px;
}

.search-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
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
  min-width: 150px;
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

.data-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  background-color: #f0f2f5;
  padding: 12px 0;
  font-weight: bold;
}

.header-cell {
  padding: 0 15px;
}

.table-body {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #e1e1e1;
  padding: 12px 0;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 0 15px;
  display: flex;
  align-items: center;
}

.col-id {
  width: 50px;
  flex-shrink: 0;
}

.col-name, .col-surname {
  width: 150px;
  flex-shrink: 0;
}

.col-email {
  flex: 1;
  min-width: 200px;
}

.col-country {
  width: 120px;
  flex-shrink: 0;
}

.col-phone {
  width: 150px;
  flex-shrink: 0;
}

.col-type {
  width: 150px;
  flex-shrink: 0;
}

.col-actions {
  width: 120px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 5px;
  cursor: pointer;
}

.view {
  background-color: #443BC9;
  color: white;
}

.edit {
  background-color: #4caf50;
  color: white;
}

.approve {
  background-color: #4caf50;
  color: white;
}

.reject {
  background-color: #f44336;
  color: white;
}

/* Модальне вікно */
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
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
}

.close-btn {
  background-color: #f0f2f5;
  color: #333;
}

.cancel-btn {
  background-color: #f0f2f5;
  color: #333;
  margin-right: 10px;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}
</style>