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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="dropdown-arrow"
            >
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
          @input="handleSearch"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="search-icon"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>

    <!-- Індикатор завантаження -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Завантаження даних...</p>
    </div>

    <!-- Таблиця студентів -->
    <div v-else-if="activeTab === 'students'" class="data-table">
      <div class="table-header">
        <div class="header-cell col-id">ID</div>
        <div class="header-cell col-name">Ім'я</div>
        <div class="header-cell col-surname">Прізвище</div>
        <div class="header-cell col-email">Email</div>
        <div class="header-cell col-country">Код країни</div>
        <div class="header-cell col-phone">Номер телефону</div>
        <div class="header-cell col-actions">Дії</div>
      </div>
      <div class="table-body" v-if="filteredStudents.length > 0">
        <div v-for="student in filteredStudents" :key="student.id" class="table-row">
          <div class="cell col-id">{{ student.id }}</div>
          <div class="cell col-name">{{ student.first_name }}</div>
          <div class="cell col-surname">{{ student.last_name }}</div>
          <div class="cell col-email">{{ student.email }}</div>
          <div class="cell col-country">{{ student.phone ? student.phone.slice(0, 4) : '' }}</div>
          <div class="cell col-phone">{{ student.phone ? student.phone.slice(4) : '' }}</div>
          <div class="cell col-actions">
            <button class="action-button view" @click="viewStudent(student)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="action-button edit" @click="editStudent(student)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Студентів не знайдено</p>
      </div>
    </div>

    <!-- Таблиця запитів -->
    <div v-else-if="activeTab === 'requests'" class="data-table">
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="action-button approve" @click="approveRequest(request)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button class="action-button reject" @click="rejectRequest(request)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагінація -->
    <div class="pagination" v-if="activeTab === 'students' && !loading && totalPages > 1">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="pagination-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div class="page-info">Сторінка {{ currentPage }} з {{ totalPages }}</div>

      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="pagination-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Модальне вікно перегляду студента -->
    <div v-if="isViewModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Перегляд студента</h2>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="!modalLoading">
            <div class="form-group">
              <label>Ім'я</label>
              <input type="text" v-model="currentStudent.first_name" disabled />
            </div>
            <div class="form-group">
              <label>Прізвище</label>
              <input type="text" v-model="currentStudent.last_name" disabled />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="currentStudent.email" disabled />
            </div>
            <div class="form-group">
              <label>Номер телефону</label>
              <input type="text" v-model="currentStudent.phone" disabled />
            </div>
          </div>
          <div v-else class="modal-loading">
            <div class="spinner"></div>
            <p>Завантаження даних...</p>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
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
          <div v-if="!modalLoading">
            <div class="form-group">
              <label>Ім'я</label>
              <input type="text" v-model="currentStudent.first_name" />
            </div>
            <div class="form-group">
              <label>Прізвище</label>
              <input type="text" v-model="currentStudent.last_name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="currentStudent.email" />
            </div>
            <div class="form-group">
              <label>Номер телефону</label>
              <input type="text" v-model="currentStudent.phone" />
            </div>
          </div>
          <div v-else class="modal-loading">
            <div class="spinner"></div>
            <p>Завантаження даних...</p>
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
        <div class="modal-footer">
          <button class="button cancel-btn" @click="closeModal">Скасувати</button>
          <button class="button save-btn" @click="saveStudent" :disabled="modalLoading">
            Змінити
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { studentsAPI } from '@/services/api'

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
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      },
      students: [],
      requests: [
        // Тимчасові дані для запитів - в майбутньому також будуть з API
        {
          id: '001',
          firstName: 'Онопко',
          lastName: 'Онопко',
          email: 'onop24622@gmail.com',
          phone: '+380 665035153',
          type: 'Перевірка оплати',
        },
        {
          id: '002',
          firstName: 'Онопко',
          lastName: 'Онопко',
          email: 'onop24622@gmail.com',
          phone: '+380 665035153',
          type: 'Доступно',
        },
        {
          id: '003',
          firstName: 'Онопко',
          lastName: 'Онопко',
          email: 'onop24622@gmail.com',
          phone: '+380 665035153',
          type: 'Перевірка оплати',
        },
      ],
      loading: false,
      modalLoading: false,
      errorMessage: '',
      totalPages: 1,
      currentPage: 1,
      perPage: 10,
      searchTimeout: null,
    }
  },
  computed: {
    filteredStudents() {
      return this.students
    },
    filteredRequests() {
      let filtered = this.requests

      // Фільтр за типом
      if (this.selectedFilter !== 'Всі') {
        filtered = filtered.filter((req) => req.type === this.selectedFilter)
      }

      // Фільтр за пошуковим запитом
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (req) =>
            req.id.toLowerCase().includes(query) ||
            req.firstName.toLowerCase().includes(query) ||
            req.lastName.toLowerCase().includes(query) ||
            req.email.toLowerCase().includes(query) ||
            req.phone.toLowerCase().includes(query),
        )
      }

      return filtered
    },
  },
  mounted() {
    this.fetchStudents()
  },
  methods: {
    async fetchStudents() {
      this.loading = true

      try {
        const params = {
          page: this.currentPage,
          per_page: this.perPage,
        }

        if (this.searchQuery) {
          params.search = this.searchQuery
        }

        const response = await studentsAPI.getAll(params)

        // Перевіряємо, чи відповідь містить ключ "users"
        if (response.data && response.data.users) {
          this.students = response.data.users
          this.totalPages = Math.ceil(this.students.length / this.perPage)
        } else if (response.data && response.data.data) {
          // Альтернативна структура відповіді
          this.students = response.data.data
          this.totalPages =
            response.data.last_page || Math.ceil(this.students.length / this.perPage)
        } else {
          // Якщо API повертає просто масив
          this.students = response.data || []
          this.totalPages = Math.ceil(this.students.length / this.perPage)
        }

        console.log('Отримані студенти:', this.students)
      } catch (error) {
        console.error('Помилка при отриманні списку студентів:', error)
        this.errorMessage = 'Не вдалося завантажити список студентів'
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      // Робимо затримку для уникнення занадто частих запитів
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1 // Повертаємося на першу сторінку при пошуку
        this.fetchStudents()
      }, 300)
    },

    changePage(page) {
      this.currentPage = page
      this.fetchStudents()
    },

    setActiveTab(tab) {
      this.activeTab = tab
      this.searchQuery = ''

      if (tab === 'students') {
        this.fetchStudents()
      }
    },

    setFilter(filter) {
      this.selectedFilter = filter
    },

    async viewStudent(student) {
      this.modalLoading = true
      this.errorMessage = ''
      this.isViewModalOpen = true

      try {
        // Отримуємо детальну інформацію про користувача
        const response = await studentsAPI.getById(student.id)

        // Перевіряємо, чи відповідь містить ключ "user"
        if (response.data && response.data.user) {
          this.currentStudent = response.data.user
        } else {
          this.currentStudent = response.data // Для зворотної сумісності
        }

        console.log('Деталі студента:', this.currentStudent)
      } catch (error) {
        console.error('Помилка при отриманні деталей студента:', error)
        this.errorMessage = 'Не вдалося завантажити дані студента'
      } finally {
        this.modalLoading = false
      }
    },

    async editStudent(student) {
      this.modalLoading = true
      this.errorMessage = ''
      this.isEditModalOpen = true

      try {
        // Отримуємо детальну інформацію про користувача
        const response = await studentsAPI.getById(student.id)

        // Перевіряємо, чи відповідь містить ключ "user"
        if (response.data && response.data.user) {
          this.currentStudent = response.data.user
        } else {
          this.currentStudent = response.data // Для зворотної сумісності
        }

        console.log('Деталі студента для редагування:', this.currentStudent)
      } catch (error) {
        console.error('Помилка при отриманні деталей студента:', error)
        this.errorMessage = 'Не вдалося завантажити дані студента'
      } finally {
        this.modalLoading = false
      }
    },

    closeModal() {
      this.isViewModalOpen = false
      this.isEditModalOpen = false
      this.errorMessage = ''
    },

    async saveStudent() {
      this.modalLoading = true
      this.errorMessage = ''

      try {
        // Відправляємо оновлені дані на сервер
        await studentsAPI.update(this.currentStudent.id, this.currentStudent)

        // Оновлюємо список студентів
        this.fetchStudents()

        // Закриваємо модальне вікно
        this.closeModal()
      } catch (error) {
        console.error('Помилка при оновленні даних студента:', error)

        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message
        } else {
          this.errorMessage = 'Не вдалося оновити дані студента'
        }
      } finally {
        this.modalLoading = false
      }
    },
    // Тимчасово - показуємо дані запиту

    viewRequest(request) {
      // Тимчасово - показуємо дані запиту
      this.currentStudent = {
        first_name: request.firstName,
        last_name: request.lastName,
        email: request.email,
        phone: request.phone,
      }
      this.isViewModalOpen = true
    },

    approveRequest(request) {
      // Тимчасово - видаляємо запит зі списку
      const index = this.requests.findIndex((r) => r.id === request.id)
      if (index !== -1) {
        this.requests.splice(index, 1)
      }
    },

    rejectRequest(request) {
      // Тимчасово - видаляємо запит зі списку
      const index = this.requests.findIndex((r) => r.id === request.id)
      if (index !== -1) {
        this.requests.splice(index, 1)
      }
    },
  },
}
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
  color: #443bc9;
  border-bottom: 2px solid #443bc9;
}

.request-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #443bc9;
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

.col-name,
.col-surname {
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
  background-color: #443bc9;
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

/* Індикатор завантаження */
.loading-indicator,
.modal-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  color: #666;
}

/* Пагінація */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  border: 1px solid #e1e1e1;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 15px;
  font-size: 14px;
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 5px;
  margin-top: 10px;
  font-size: 14px;
}
</style>
