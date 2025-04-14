<!-- src/components/admin/students/StudentDetail.vue -->
<template>
  <div class="student-detail-container">
    <div class="breadcrumb">
      <router-link to="/admin/students" class="breadcrumb-link">Студенти</router-link>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-current">{{ student.first_name }} {{ student.last_name }}</span>
    </div>

    <div class="tab-navigation">
      <div class="tab active">Студент</div>
      <div class="tab">Курси</div>
      <div class="tab">Оплати</div>
    </div>

    <div class="student-info-wrapper">
      <div class="student-photo-container">
        <img
          :src="studentPhoto"
          alt="Фото студента"
          class="student-photo"
          @error="handleImageError"
        />
        <div class="registration-date">Зареєстровано: {{ formattedRegistrationDate }}</div>
      </div>

      <div class="fields-container">
        <div class="fields-row">
          <div class="field-column">
            <div class="field-label">Ім'я</div>
            <input type="text" v-model="studentFirstName" disabled />
          </div>
          <div class="field-column">
            <div class="field-label">Прізвище</div>
            <input type="text" v-model="studentLastName" disabled />
          </div>
        </div>

        <div class="fields-row">
          <div class="field-column">
            <div class="field-label">Email</div>
            <input type="email" v-model="studentEmail" disabled />
          </div>
          <div class="field-column">
            <div class="field-label">Номер телефону</div>
            <div class="phone-container">
              <input type="text" :value="phoneCountryCode" disabled class="phone-code" />
              <input type="text" :value="phoneNumber" disabled class="phone-number" />
            </div>
          </div>
        </div>
      </div>

      <div class="edit-button-container">
        <button class="edit-button" @click="$emit('edit')">
          <i class="mdi mdi-pencil"></i>
        </button>
      </div>
    </div>

    <div class="comments-section">
      <div class="section-title">Коментарі</div>
    </div>

    <div class="activity-section">
      <div class="section-title">Активність</div>
    </div>

    <div class="deactivate-button-container">
      <button class="deactivate-button" @click="$emit('deactivate')">Деактивація студента</button>
    </div>
  </div>
</template>

<script>
import { getImageUrl } from '@/services/api.js'

export default {
  name: 'StudentDetail',
  props: {
    student: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      imageError: false,
    }
  },
  computed: {
    studentData() {
      // Перевіряємо, чи дані студента знаходяться в полі user (API може повертати різні структури)
      return this.student.user || this.student
    },
    studentFirstName() {
      // Безпечно отримуємо first_name
      return this.studentData.first_name || ''
    },
    studentLastName() {
      // Безпечно отримуємо last_name
      return this.studentData.last_name || ''
    },
    studentEmail() {
      // Безпечно отримуємо email
      return this.studentData.email || ''
    },
    studentPhoto() {
      // Якщо була помилка завантаження, показуємо заглушку
      if (this.imageError) {
        return 'https://via.placeholder.com/150'
      }

      // Перевіряємо profile_photo (який може бути в API)
      if (this.studentData.profile_photo) {
        return getImageUrl(this.studentData.profile_photo)
      }

      // Перевіряємо avatar як запасний варіант
      if (this.studentData.avatar) {
        return getImageUrl(this.studentData.avatar)
      }

      // Якщо немає фото, повертаємо заглушку
      return 'https://via.placeholder.com/150'
    },
    phoneCountryCode() {
      // Перевіряємо, чи є поле country і повертаємо код країни
      if (this.studentData.country && this.studentData.country.phone_code) {
        return this.studentData.country.phone_code
      }
      return '+380' // Стандартний код для України як запасний варіант
    },
    phoneNumber() {
      // Отримуємо повний номер телефону
      const fullPhone = this.studentData.phone_number || ''

      // Перевіряємо, чи номер телефону містить код країни
      if (fullPhone.startsWith('+380') || fullPhone.startsWith('380')) {
        // Видаляємо код країни з номера
        if (fullPhone.startsWith('+380')) {
          return fullPhone.substring(4) // Пропускаємо "+380"
        } else if (fullPhone.startsWith('380')) {
          return fullPhone.substring(3) // Пропускаємо "380"
        }
      }

      // Якщо номер не містить код країни, повертаємо як є
      return fullPhone
    },
    formattedRegistrationDate() {
      try {
        // Спробуємо використати created_at
        if (this.studentData.created_at) {
          const date = new Date(this.studentData.created_at)

          // Перевіряємо, чи дата валідна
          if (!isNaN(date.getTime())) {
            return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}.${date.getFullYear()}`
          }
        }

        // Якщо немає created_at або дата невалідна
        return '05.18.2025' // Заглушка для прикладу
      } catch (error) {
        console.error('Помилка форматування дати:', error)
        return '05.18.2025' // Заглушка в разі помилки
      }
    },
  },
  methods: {
    handleImageError(e) {
      console.warn('Помилка завантаження аватару студента, використовується заглушка')
      this.imageError = true
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');

* {
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.student-detail-container {
  padding: 0;
  background-color: #f8f9fa;
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #443bc9;
  text-decoration: none;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #666;
}

.breadcrumb-current {
  font-weight: 500;
}

.tab-navigation {
  display: flex;
  margin-bottom: 40px;
  border-bottom: 1px solid #e1e1e1;
}

.tab {
  padding: 12px 24px;
  cursor: pointer;
  position: relative;
  font-weight: 500;
}

.tab.active {
  color: #443bc9;
  border-bottom: 2px solid #443bc9;
}

.student-info-wrapper {
  display: flex;
  padding: 20px 0 40px;
  position: relative;
}

.student-photo-container {
  width: 200px;
  margin-right: 20px;
}

.student-photo {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 10px;
}

.breadcrumb,
.tab,
.field-label,
.field-column input,
.phone-code,
.phone-number,
.registration-date,
.section-title,
.deactivate-button {
  font-family: 'VinnytsiaSansReg', sans-serif;
}

.registration-date {
  font-size: 12px;
  color: #666;
}

.fields-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fields-row {
  display: flex;
  margin-bottom: 20px;
  width: 100%;
}

.field-column {
  flex: 1;
  margin-right: 15px;
}

.field-label {
  margin-bottom: 8px;
  font-weight: normal;
  font-size: 14px;
}

.field-column input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 5px;
  background-color: #fff;
}

.phone-container {
  display: flex;
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
}

.phone-code {
  width: 70px;
  padding: 8px;
  border: 1px solid #e1e1e1;
  border-radius: 5px 0 0 5px;
  border-right: none;
  background-color: #fff;
  text-align: center;
  flex: 0 0 70px;
}

.phone-number {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 0 5px 5px 0;
  background-color: #fff;
  min-width: 0;
  width: auto;
}

.edit-button-container {
  position: absolute;
  top: -10px;
  right: 0;
}

.edit-button {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #443bc9;
  color: white;
  cursor: pointer;
}

.mdi {
  font-size: 18px;
}

.comments-section,
.activity-section {
  padding: 30px 0;
}

.section-title {
  font-size: 16px;
  margin: 0;
  font-weight: normal;
}

.deactivate-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
}

.deactivate-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
}
</style>
