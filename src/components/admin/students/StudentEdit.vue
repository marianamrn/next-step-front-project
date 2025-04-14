<!-- src/components/admin/students/StudentEdit.vue -->
<template>
  <div v-if="isEditModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Редагування студента</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <div v-if="!loading">
          <div class="form-group">
            <label>Ім'я</label>
            <input type="text" v-model="studentData.first_name" />
          </div>
          <div class="form-group">
            <label>Прізвище</label>
            <input type="text" v-model="studentData.last_name" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="studentData.email" />
          </div>
          <div class="form-group">
            <label>Номер телефону</label>
            <div class="phone-container">
              <div class="phone-code-wrapper">
                <input type="text" v-model="phoneCountryCode" class="phone-code" disabled />
              </div>
              <input
                type="text"
                v-model="phoneNumber"
                class="phone-number"
                @input="updateFullPhoneNumber"
              />
            </div>
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
        <button class="button save-btn" @click="saveStudent" :disabled="loading">Змінити</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentEdit',
  props: {
    isEditModalOpen: {
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
  data() {
    return {
      studentData: {},
      phoneCountryCode: '+380',
      phoneNumber: '',
    }
  },
  watch: {
    student: {
      handler(newVal) {
        this.studentData = { ...newVal }
        this.initializePhoneData()
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    initializePhoneData() {
      // Встановлення коду країни
      if (this.student.country && this.student.country.phone_code) {
        this.phoneCountryCode = this.student.country.phone_code
      } else {
        this.phoneCountryCode = '+380' // Значення за замовчуванням
      }

      // Парсинг номера телефону
      const fullPhone = this.student.phone_number || this.student.phone || ''

      if (fullPhone.startsWith('+' + this.phoneCountryCode.substring(1))) {
        this.phoneNumber = fullPhone.substring(this.phoneCountryCode.length)
      } else if (fullPhone.startsWith(this.phoneCountryCode)) {
        this.phoneNumber = fullPhone.substring(this.phoneCountryCode.length)
      } else if (fullPhone.startsWith('380')) {
        this.phoneNumber = fullPhone.substring(3)
      } else if (fullPhone.startsWith('+380')) {
        this.phoneNumber = fullPhone.substring(4)
      } else {
        this.phoneNumber = fullPhone
      }
    },
    updateFullPhoneNumber() {
      this.studentData.phone_number = this.phoneNumber
    },
    closeModal() {
      this.$emit('close')
    },
    saveStudent() {
      const updatedData = {
        ...this.studentData,
        phone_number: this.phoneNumber,
        // Додаємо інформацію про код країни окремо, якщо це необхідно
        country: {
          ...this.studentData.country,
          phone_code: this.phoneCountryCode,
        },
      }
      this.$emit('save', updatedData)
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
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.phone-container {
  display: flex;
  width: 100%;
  height: 38px;
}

.phone-code-wrapper {
  width: 80px;
  flex-shrink: 0;
}

.phone-code {
  width: 100%;
  height: 100%;
  padding: 8px;
  border: 1px solid #e1e1e1;
  border-radius: 5px 0 0 5px;
  background-color: #f9fafb;
  text-align: center;
  font-family: 'VinnytsiaSansReg', sans-serif;
  box-sizing: border-box;
}

.phone-number {
  flex: 1;
  height: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 0 5px 5px 0;
  font-family: 'VinnytsiaSansReg', sans-serif;
  box-sizing: border-box;
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

.cancel-btn {
  background-color: #f0f2f5;
  color: #333;
  margin-right: 10px;
}

.save-btn {
  background-color: #4caf50;
  color: white;
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
