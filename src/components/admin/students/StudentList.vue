<!-- src/components/admin/students/StudentList.vue -->
<template>
  <div>
    <!-- Індикатор завантаження -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Завантаження даних...</p>
    </div>

    <!-- Таблиця студентів -->
    <div v-else class="data-table">
      <div class="table-header">
        <div class="header-cell col-id">ID</div>
        <div class="header-cell col-name">Ім'я</div>
        <div class="header-cell col-surname">Прізвище</div>
        <div class="header-cell col-email">Email</div>
        <div class="header-cell col-country text-right">Код країни</div>
        <div class="header-cell col-phone">Номер телефону</div>
        <div class="header-cell col-actions text-left">Дії</div>
      </div>
      <div class="table-body" v-if="students.length > 0">
        <div v-for="student in students" :key="student.id" class="table-row">
          <div class="cell col-id">{{ student.id }}</div>
          <div class="cell col-name">{{ student.first_name }}</div>
          <div class="cell col-surname">{{ student.last_name }}</div>
          <div class="cell col-email">{{ student.email }}</div>
          <div class="cell col-country text-right">{{ getPhoneCode(student) }}</div>
          <div class="cell col-phone">{{ getPhoneNumber(student) }}</div>
          <div class="cell col-actions">
            <button class="action-button view" @click="viewStudent(student)">
              <v-icon>mdi-eye</v-icon>
            </button>
            <button class="action-button edit" @click="editStudent(student)">
              <v-icon>mdi-pencil</v-icon>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="no-data">
        <p>Студентів не знайдено</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentList',
  props: {
    students: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    viewStudent(student) {
      this.$emit('view-student', student)
    },
    editStudent(student) {
      this.$emit('edit-student', student)
    },
    getPhoneCode(student) {
      // Перевіряємо структуру даних студента для отримання коду країни
      if (student.country && student.country.phone_code) {
        return student.country.phone_code
      }
      return '+380' // За замовчуванням
    },
    getPhoneNumber(student) {
      // Отримання номера телефону без коду країни
      const phoneCode = this.getPhoneCode(student)
      let phoneNumber = student.phone_number || student.phone || ''

      // Видалення коду країни з номера
      if (phoneNumber.startsWith('+' + phoneCode.substring(1))) {
        // Якщо номер починається з "+380"
        return phoneNumber.substring(phoneCode.length)
      } else if (phoneNumber.startsWith(phoneCode)) {
        // Якщо номер починається з "+380"
        return phoneNumber.substring(phoneCode.length)
      } else if (phoneNumber.startsWith('380')) {
        // Якщо номер починається з "380"
        return phoneNumber.substring(3)
      } else if (phoneNumber.startsWith('+380')) {
        // Якщо номер починається з "+380"
        return phoneNumber.substring(4)
      }

      return phoneNumber
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');

* {
  font-family: 'VinnytsiaSansReg', sans-serif;
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

.col-id {
  width: 50px;
  flex-shrink: 0;
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
  width: 120px;
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

.action-button:first-child {
  margin-left: 0;
}

.view {
  background-color: #443bc9;
  color: white;
}

.edit {
  background-color: #4caf50;
  color: white;
}

/* Індикатор завантаження */
.loading-indicator {
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
</style>
