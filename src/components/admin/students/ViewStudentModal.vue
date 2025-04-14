<!-- src/components/admin/students/ViewStudentModal.vue -->
<template>
  <div v-if="isViewModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Перегляд студента</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <div v-if="!loading">
          <div class="form-group">
            <label>Ім'я</label>
            <input type="text" v-model="student.first_name" disabled />
          </div>
          <div class="form-group">
            <label>Прізвище</label>
            <input type="text" v-model="student.last_name" disabled />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="student.email" disabled />
          </div>
          <div class="form-group">
            <label>Номер телефону</label>
            <input type="text" v-model="formattedPhone" disabled />
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
</template>

<script>
export default {
  name: 'ViewStudentModal',
  props: {
    isViewModalOpen: {
      type: Boolean,
      required: true,
    },
    student: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  computed: {
    formattedPhone() {
      if (!this.student) return ''

      // Отримання номера телефону з різних полів
      // Використовуємо phone_number, якщо воно є, інакше - phone
      let phone = this.student.phone_number || this.student.phone || ''

      if (!phone) return ''

      let countryCode = '+380' // Значення за замовчуванням
      if (this.student.country && this.student.country.phone_code) {
        countryCode = this.student.country.phone_code
      }

      // Форматуємо номер телефону для відображення
      if (phone.startsWith('+')) {
        return phone // Якщо номер вже містить +, повертаємо його без змін
      } else if (phone.startsWith('380')) {
        return '+' + phone // Додаємо + до 380
      } else {
        // Якщо номер не містить код країни, додаємо його
        return countryCode + phone
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');

* {
  font-family: 'VinnytsiaSansReg', sans-serif;
}

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
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  font-family: 'VinnytsiaSansReg', sans-serif;
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
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  background-color: #f9fafb;
  font-family: 'VinnytsiaSansReg', sans-serif;
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
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.close-btn {
  background-color: #f0f2f5;
  color: #333;
}

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

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 5px;
  margin-top: 10px;
  font-size: 14px;
  font-family: 'VinnytsiaSansReg', sans-serif;
}
</style>
