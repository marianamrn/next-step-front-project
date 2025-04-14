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

    <!-- Студенти вкладка -->
    <template v-if="activeTab === 'students'">
      <!-- Якщо не обрано студента, показуємо пошук і список -->
      <template v-if="!selectedStudent">
        <search-panel
          :activeTab="activeTab"
          :selectedFilter="selectedFilter"
          @search="handleSearch"
          @filter-change="setFilter"
        />

        <student-list
          :students="filteredStudents"
          :loading="loading"
          :totalPages="totalPages"
          :currentPage="currentPage"
          @view-student="viewStudent"
          @edit-student="editStudent"
          @change-page="changePage"
        />
      </template>

      <!-- Якщо обрано студента, показуємо деталі -->
      <student-detail
        v-else
        :student="currentStudent"
        @edit="openEditModal"
        @deactivate="deactivateStudent"
      />
    </template>

    <!-- Запити вкладка -->
    <template v-if="activeTab === 'requests'">
      <search-panel
        :activeTab="activeTab"
        :selectedFilter="selectedFilter"
        @search="handleSearch"
        @filter-change="setFilter"
      />

      <student-requests
        :requests="filteredRequests"
        @view-request="viewRequest"
        @approve-request="approveRequest"
        @reject-request="rejectRequest"
      />
    </template>

    <!-- Модальні вікна -->
    <view-student-modal
      :isViewModalOpen="isViewModalOpen"
      :student="currentStudent"
      :loading="modalLoading"
      :errorMessage="errorMessage"
      @close="closeModal"
    />

    <student-edit
      :isEditModalOpen="isEditModalOpen"
      :student="currentStudent"
      :loading="modalLoading"
      :errorMessage="errorMessage"
      @close="closeModal"
      @save="saveStudent"
    />
  </div>
</template>

<script>
import { studentsApi } from '@/services/api.js'
import SearchPanel from './students/SearchPanel.vue'
import StudentList from './students/StudentList.vue'
import StudentRequests from './students/StudentRequests.vue'
import StudentDetail from './students/StudentDetail.vue'
import StudentEdit from './students/StudentEdit.vue'
import ViewStudentModal from './students/ViewStudentModal.vue'

export default {
  name: 'StudentManagement',
  components: {
    SearchPanel,
    StudentList,
    StudentRequests,
    StudentDetail,
    StudentEdit,
    ViewStudentModal,
  },
  props: {
    id: {
      // Додаємо prop для ID студента з URL
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      activeTab: 'students',
      searchQuery: '',
      selectedFilter: 'Всі',
      isViewModalOpen: false,
      isEditModalOpen: false,
      selectedStudent: null,
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
  watch: {
    id: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.loadStudentById(newId)
        }
      },
    },
  },
  mounted() {
    this.fetchStudents()
  },
  methods: {
    async loadStudentById(studentId) {
      this.modalLoading = true
      this.errorMessage = ''

      try {
        const response = await studentsApi.getStudentById(studentId) // Оновлена назва методу

        if (response.data && response.data.user) {
          this.currentStudent = response.data.user
        } else {
          this.currentStudent = response.data
        }

        this.selectedStudent = this.currentStudent
      } catch (error) {
        console.error('Помилка при завантаженні даних студента:', error)
        this.errorMessage = 'Не вдалося завантажити дані студента'
      } finally {
        this.modalLoading = false
      }
    },

    async fetchStudents() {
      this.loading = true

      try {
        const response = await studentsApi.getStudents(this.currentPage, this.perPage)

        // Перевіряємо, чи відповідь містить ключ "users"
        // або "data" (для зворотної сумісності)
        // або просто масив студентів
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

    async handleSearch(query) {
      this.searchQuery = query
      this.currentPage = 1

      if (this.activeTab === 'students') {
        this.loading = true
        try {
          // Якщо пошуковий запит є id (числом)
          if (query && !isNaN(query)) {
            const response = await studentsApi.getStudentById(query)
            if (response.data) {
              this.students = [response.data]
              this.totalPages = 1
            } else {
              this.students = []
              this.totalPages = 0
            }
          }
          // Якщо пошуковий запит інший текст
          else if (query) {
            const response = await studentsApi.searchStudents(query, this.currentPage, this.perPage)
            if (response.data && response.data.data) {
              this.students = response.data.data
              this.totalPages = response.data.last_page || 1
            } else {
              this.students = response.data || []
              this.totalPages = 1
            }
          }
          // Якщо пошуковий запит порожній, повертаємо всіх студентів
          else {
            this.fetchStudents()
          }
        } catch (error) {
          console.error('Помилка при пошуку студентів:', error)
          this.students = []
          this.totalPages = 0
        } finally {
          this.loading = false
        }
      }
    },

    changePage(page) {
      this.currentPage = page
      this.fetchStudents()
    },

    setActiveTab(tab) {
      this.activeTab = tab
      this.searchQuery = ''
      this.selectedStudent = null

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

      try {
        const response = await studentsApi.getStudentById(student.id)

        // Перевіряємо, чи відповідь містить ключ "user"
        if (response.data && response.data.user) {
          this.currentStudent = response.data.user
        } else {
          this.currentStudent = response.data // Для зворотної сумісності
        }

        // Встановлюємо обраного студента для показу детальної інформації
        this.selectedStudent = this.currentStudent

        // Оновлюємо URL для прямого доступу до студента
        this.$router.push(`/admin/students/${student.id}`)
      } catch (error) {
        console.error('Помилка при отриманні деталей студента:', error)
        this.errorMessage = 'Не вдалося завантажити дані студента'
        this.isViewModalOpen = true
      } finally {
        this.modalLoading = false
      }
    },

    editStudent(student) {
      this.modalLoading = true
      this.errorMessage = ''
      this.isEditModalOpen = true

      try {
        // Встановлюємо поточного студента для редагування
        this.currentStudent = { ...student }
      } catch (error) {
        console.error('Помилка при підготовці до редагування студента:', error)
        this.errorMessage = 'Не вдалося підготувати дані для редагування'
      } finally {
        this.modalLoading = false
      }
    },

    openEditModal() {
      this.isEditModalOpen = true
    },

    closeModal() {
      this.isViewModalOpen = false
      this.isEditModalOpen = false
      this.errorMessage = ''
    },

    async saveStudent(updatedStudent) {
      this.modalLoading = true
      this.errorMessage = ''

      try {
        // Відправляємо оновлені дані на сервер
        await studentsApi.updateStudent(updatedStudent.id, updatedStudent)

        // Оновлюємо дані поточного студента
        this.currentStudent = { ...updatedStudent }

        // Якщо був обраний студент, оновлюємо його дані
        if (this.selectedStudent) {
          this.selectedStudent = { ...updatedStudent }
        }

        // Оновлюємо список студентів
        this.fetchStudents()

        // Закриваємо модальне вікно редагування
        this.isEditModalOpen = false
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

    async deactivateStudent() {
      this.modalLoading = true
      this.errorMessage = ''

      try {
        // Відправляємо запит на деактивацію
        await studentsApi.deactivateStudent(this.currentStudent.id)

        // Повертаємось до списку
        this.selectedStudent = null

        // Оновлюємо URL
        this.$router.push('/admin/students')

        // Оновлюємо список студентів
        this.fetchStudents()
      } catch (error) {
        console.error('Помилка при деактивації студента:', error)

        if (error.response && error.response.data && error.response.data.message) {
          this.errorMessage = error.response.data.message
        } else {
          this.errorMessage = 'Не вдалося деактивувати студента'
        }

        alert('Помилка: ' + this.errorMessage)
      } finally {
        this.modalLoading = false
      }
    },

    viewRequest(request) {
      // Тимчасово - показуємо дані запиту в модальному вікні
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
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');

* {
  font-family: 'VinnytsiaSansReg', sans-serif;
}

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
</style>
