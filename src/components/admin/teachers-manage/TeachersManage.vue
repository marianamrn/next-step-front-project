<template>
  <div class="teachers-manage-root">
    <div class="header-row">
      <h2></h2>
      <v-btn color="primary" @click="openAddDialog">Додати викладача</v-btn>
    </div>
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Завантаження даних...</p>
    </div>
    <div v-else class="data-table">
      <div class="table-header">
        <div class="header-cell col-name">Ім'я</div>
        <div class="header-cell col-surname">Прізвище</div>
        <div class="header-cell col-email">Email</div>
        <div class="header-cell col-country text-right">Код країни</div>
        <div class="header-cell col-phone">Номер телефону</div>
        <div class="header-cell col-actions text-left">Дії</div>
      </div>
      <div class="table-body" v-if="teachers.length > 0">
        <div v-for="teacher in teachers" :key="teacher.id" class="table-row">
          <div class="cell col-name">{{ teacher.name }}</div>
          <div class="cell col-surname">{{ teacher.last_name }}</div>
          <div class="cell col-email">{{ teacher.email }}</div>
          <div class="cell col-country text-right">{{ teacher.country_code || '+380' }}</div>
          <div class="cell col-phone">{{ teacher.phone_number || '' }}</div>
          <div class="cell col-actions">
            <button class="action-button view" @click="goToTeacherDetail(teacher)">
              <v-icon color="white">mdi-eye</v-icon>
            </button>
            <button class="action-button edit" @click="editTeacher(teacher)">
              <v-icon color="white">mdi-pencil</v-icon>
            </button>
            <button
              v-if="teacher.role?.name !== 'super_admin' && teacher.role?.name !== 'admin'"
              class="action-button remove-red"
              @click="confirmRemoveTeacher(teacher)"
            >
              <v-icon color="white">mdi-account-remove</v-icon>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Викладачів не знайдено</p>
      </div>
    </div>
    <!-- Діалог додавання викладача -->
    <v-dialog v-model="addDialog" max-width="600px">
      <v-card>
        <v-card-title>Виберіть користувача</v-card-title>
        <v-card-text>
          <v-data-table
            :headers="addUserHeaders"
            :items="usersForSelect"
            item-key="id"
            :model-value="selectedUserId ? [selectedUserId] : []"
            @update:model-value="onSelectUser"
            class="add-user-table"
            hide-default-footer
            show-select
          >
            <template v-slot:[`item.avatar`]="{ item }">
              <div class="avatar-circle">{{ getInitials(item) }}</div>
            </template>
            <template v-slot:[`item.last_name`]="{ item }">
              {{ item.last_name || '' }}
            </template>
            <template v-slot:[`item.name`]="{ item }">
              {{ item.name || '' }}
            </template>
            <template v-slot:[`item.role`]="{ item }">
              {{ getRoleLabel(item.role) }}
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="addDialog = false">Скасувати</v-btn>
          <v-btn color="primary" @click="addTeacher" :disabled="!selectedUserId">Додати</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Модальне вікно перегляду -->
    <ViewTeacherModal
      :isViewModalOpen="isViewModalOpen"
      :teacher="selectedTeacher"
      @close="isViewModalOpen = false"
      @deactivated="fetchAllUsers"
    />
    <!-- Модальне вікно редагування -->
    <TeacherEditModal
      :isEditModalOpen="isEditModalOpen"
      :teacher="selectedTeacher"
      :title="'Редагування викладача'"
      @close="isEditModalOpen = false"
      @save="saveTeacher"
    />
  </div>
</template>

<script>
import { adminsApi, studentsApi } from '@/services/api.js'
import ViewTeacherModal from './ViewTeacherModal.vue'
import TeacherEditModal from './TeacherEditModal.vue'

export default {
  name: 'TeachersManage',
  components: { ViewTeacherModal, TeacherEditModal },
  data() {
    return {
      teachers: [],
      users: [],
      addDialog: false,
      selectedUserId: null,
      loading: false,
      isViewModalOpen: false,
      isEditModalOpen: false,
      selectedTeacher: null,
      addUserHeaders: [
        { text: '', value: 'avatar', sortable: false },
        { text: 'Прізвище', value: 'last_name' },
        { text: "Ім'я", value: 'name' },
        { text: 'Роль', value: 'role' },
      ],
    }
  },
  computed: {
    usersForSelect() {
      const usersArr = Array.isArray(this.users) ? this.users : []
      return usersArr
        .filter(
          (u) =>
            u.role?.name !== 'teacher' &&
            u.role?.name !== 'admin' &&
            u.role?.name !== 'super_admin',
        )
        .map((u) => ({
          id: u.id,
          name: u.name || '',
          last_name: u.last_name || '',
          role: u.role?.name || '',
        }))
    },
  },
  methods: {
    getInitials(user) {
      const n = (user.name || '').charAt(0)
      const l = (user.last_name || '').charAt(0)
      return `${n}${l}`.toUpperCase()
    },
    getRoleLabel(role) {
      switch (role) {
        case 'teacher':
          return 'Викладач'
        case 'student':
          return 'Студент'
        case 'admin':
          return 'Адміністратор'
        default:
          return role
      }
    },
    onSelectUser(selected) {
      if (Array.isArray(selected) && selected.length > 0) {
        if (typeof selected[0] === 'object' && selected[0] !== null) {
          this.selectedUserId = selected[0].id
        } else {
          this.selectedUserId = selected[0]
        }
      } else if (selected && selected.id) {
        this.selectedUserId = selected.id
      } else {
        this.selectedUserId = selected
      }
    },
    async fetchAllUsers() {
      this.loading = true
      try {
        const res = await studentsApi.getStudents(1, 1000)
        const usersArr = Array.isArray(res.data?.users) ? res.data.users : []
        this.users = usersArr
        this.teachers = usersArr.filter((u) => u.role?.name === 'teacher')
      } finally {
        this.loading = false
      }
    },
    openAddDialog() {
      this.selectedUserId = null
      this.addDialog = true
    },
    async addTeacher() {
      if (!this.selectedUserId) return
      try {
        await adminsApi.changeRole(this.selectedUserId, 'teacher')
        this.addDialog = false
        this.fetchAllUsers()
      } catch (e) {
        alert('Помилка при додаванні викладача')
      }
    },
    confirmRemoveTeacher(teacher) {
      if (teacher.role?.name === 'super_admin' || teacher.role?.name === 'admin') return
      if (
        confirm(
          `Ви впевнені, що хочете забрати роль викладача у ${teacher.name} ${teacher.last_name}?`,
        )
      ) {
        this.removeTeacher(teacher)
      }
    },
    async removeTeacher(teacher) {
      try {
        await adminsApi.changeRole(teacher.id, 'student')
        this.fetchAllUsers()
      } catch (e) {
        alert('Помилка при зміні ролі')
      }
    },
    viewTeacher(teacher) {
      this.selectedTeacher = teacher
      this.isViewModalOpen = true
    },
    editTeacher(teacher) {
      this.selectedTeacher = teacher
      this.isEditModalOpen = true
    },
    async saveTeacher(updatedData) {
      try {
        await studentsApi.updateStudent(updatedData.id, updatedData)
        this.isEditModalOpen = false
        this.fetchAllUsers()
      } catch (e) {
        alert('Помилка при збереженні даних користувача')
      }
    },
    goToTeacherDetail(teacher) {
      this.$router.push(`/admin/teachers/${teacher.id}`)
    },
  },
  mounted() {
    this.fetchAllUsers()
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');
* {
  font-family: 'VinnytsiaSansReg', sans-serif;
}
.teachers-manage-root {
  padding: 32px 24px 0 24px;
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
.text-right {
  justify-content: flex-end;
  text-align: right;
}
.text-left {
  justify-content: flex-start;
  text-align: left;
}
.col-name,
.col-surname {
  width: 120px;
  flex-shrink: 0;
}
.col-email {
  width: 300px;
  flex-shrink: 0;
}
.col-country {
  width: 120px;
  flex-shrink: 0;
}
.col-phone {
  width: 150px;
  flex-shrink: 0;
}
.col-actions {
  width: 180px;
  flex-shrink: 0;
  margin-left: auto;
  display: flex;
  justify-content: flex-start;
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
.action-button.view {
  background: #443bc9;
}
.action-button.edit {
  background: #43b26b;
}
.action-button.remove-red {
  background: #e53935;
}
.no-data {
  padding: 24px;
  text-align: center;
  color: #888;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #443bc9;
  border-radius: 50%;
  width: 32px;
  height: 32px;
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
.add-user-table {
  background: #f6f7fa;
  border-radius: 8px;
  margin-top: 8px;
}
.avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #e6eaff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #443bc9;
  font-size: 20px;
}
</style>
