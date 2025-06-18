<!-- src/components/admin/students/StudentDetail.vue -->
<template>
  <div class="student-detail-wrapper">
    <div class="student-detail-breadcrumbs">
      <router-link to="/admin/students" class="crumb">Студенти</router-link>
      <span class="crumb-sep">&gt;</span>
      <span>{{ studentName }} {{ studentLastName }}</span>
    </div>
    <div class="student-detail-card">
      <div class="student-detail-main">
        <div class="student-detail-left">
          <div class="avatar-big">{{ getInitials(studentData) }}</div>
          <div class="photo-label">Фото студента</div>
          <div class="reg-date">Зареєстровано: {{ formattedRegistrationDate }}</div>
        </div>
        <div class="student-detail-right">
          <div class="edit-btn-wrapper">
            <v-btn class="edit-btn" color="#443bc9" @click="$emit('edit')">
              <v-icon color="white">mdi-pencil</v-icon>
            </v-btn>
          </div>
          <div class="fields-row">
            <div class="field-col">
              <label>Ім'я</label>
              <input type="text" :value="studentName" disabled />
            </div>
            <div class="field-col">
              <label>Прізвище</label>
              <input type="text" :value="studentLastName" disabled />
            </div>
          </div>
          <div class="fields-row">
            <div class="field-col">
              <label>Email</label>
              <input type="email" :value="studentEmail" disabled />
            </div>
            <div class="field-col phone-group">
              <label>Номер телефону</label>
              <div class="phone-fields">
                <input type="text" :value="phoneCountryCode" class="phone-code" disabled />
                <input type="text" :value="phoneNumber" class="phone-number" disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="student-detail-sections">
        <div class="section-block">
          <h3>Активність</h3>
        </div>
      </div>
      <div class="student-detail-actions">
        <v-btn color="error" class="deactivate-btn" @click="$emit('deactivate')">Деактивація студента</v-btn>
      </div>
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
      return this.student.user || this.student
    },
    studentName() {
      return this.studentData.name || ''
    },
    studentLastName() {
      return this.studentData.last_name || ''
    },
    studentEmail() {
      return this.studentData.email || ''
    },
    studentPhoto() {
      if (this.imageError) {
        return 'https://via.placeholder.com/150'
      }

      if (this.studentData.profile_photo) {
        return getImageUrl(this.studentData.profile_photo)
      }

      if (this.studentData.avatar) {
        return getImageUrl(this.studentData.avatar)
      }

      return 'https://via.placeholder.com/150'
    },
    phoneCountryCode() {
      if (this.studentData.country && this.studentData.country.phone_code) {
        return this.studentData.country.phone_code
      }
      return '+380'
    },
    phoneNumber() {
      const fullPhone = this.studentData.phone_number || ''
      if (fullPhone.startsWith('+380')) {
        return fullPhone.substring(4)
      } else if (fullPhone.startsWith('380')) {
        return fullPhone.substring(3)
      }
      return fullPhone
    },
    formattedRegistrationDate() {
      try {
        if (this.studentData.created_at) {
          const date = new Date(this.studentData.created_at)
          if (!isNaN(date.getTime())) {
            return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
              .toString()
              .padStart(2, '0')}.${date.getFullYear()}`
          }
        }
        return '05.18.2025'
      } catch (error) {
        return '05.18.2025'
      }
    },
  },
  methods: {
    getInitials(user) {
      const n = (user.name || '').charAt(0)
      const l = (user.last_name || '').charAt(0)
      return `${n}${l}`.toUpperCase()
    },
    handleImageError(e) {
      console.warn('Помилка завантаження аватару студента, використовується заглушка')
      this.imageError = true
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansReg&display=swap');
* { font-family: 'VinnytsiaSansReg', sans-serif; }
.student-detail-wrapper { padding: 32px 0 0 0; max-width: 1100px; margin: 0 auto; }
.student-detail-breadcrumbs { margin-bottom: 18px; font-size: 16px; color: #443bc9; display: flex; align-items: center; }
.crumb { color: #443bc9; text-decoration: none; }
.crumb-sep { margin: 0 8px; color: #888; }
.student-detail-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 32px 32px 24px 32px; }
.student-detail-main { display: flex; gap: 32px; margin-bottom: 32px; }
.student-detail-left { min-width: 180px; display: flex; flex-direction: column; align-items: center; margin-right: 24px; }
.avatar-big { width: 80px; height: 80px; border-radius: 50%; background: #e0e7ff; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: #443bc9; margin-bottom: 10px; }
.photo-label { color: #888; font-size: 15px; margin-bottom: 8px; }
.reg-date { color: #888; font-size: 14px; }
.student-detail-right { flex: 1; position: relative; }
.edit-btn-wrapper { position: absolute; top: 0; right: 0; }
.edit-btn { min-width: 48px; min-height: 48px; border-radius: 12px; box-shadow: none; padding: 0; display: flex; align-items: center; justify-content: center; }
.fields-row { display: flex; gap: 24px; margin-bottom: 18px; }
.field-col { flex: 1; display: flex; flex-direction: column; }
.field-col label { font-size: 15px; color: #222; margin-bottom: 6px; font-weight: 500; }
.field-col input { width: 100%; padding: 10px 12px; border: 1px solid #e1e1e1; border-radius: 6px; background: #f9fafb; font-size: 16px; color: #222; }
.phone-group .phone-fields { display: flex; gap: 8px; }
.phone-code { width: 60px; min-width: 60px; max-width: 80px; }
.phone-number { flex: 1; }
.student-detail-sections { display: flex; gap: 48px; margin-top: 32px; }
.section-block { flex: 1; }
.section-block h3 { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.student-detail-actions { display: flex; justify-content: flex-end; margin-top: 40px; }
.deactivate-btn { min-width: 220px; font-size: 16px; font-weight: 500; }
</style>
