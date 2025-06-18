<template>
  <div class="admin-detail-wrapper">
    <div class="admin-detail-breadcrumbs">
      <router-link to="/admin/administrators" class="crumb">Адміністратори</router-link>
      <span class="crumb-sep">&gt;</span>
      <span>{{ admin?.name || '' }} {{ admin?.last_name || '' }}</span>
    </div>
    <div class="admin-detail-card">
      <div class="admin-detail-main">
        <div class="admin-detail-left">
          <div class="avatar-big">{{ getInitials(admin) }}</div>
          <div class="photo-label">Фото адміністратора</div>
          <div class="reg-date">Зареєстровано: {{ formatDate(admin?.created_at) }}</div>
        </div>
        <div class="admin-detail-right">
          <div class="edit-btn-wrapper">
            <v-btn class="edit-btn" color="#443bc9" @click="isEditModalOpen = true">
              <v-icon color="white">mdi-pencil</v-icon>
            </v-btn>
          </div>
          <div class="fields-row">
            <div class="field-col">
              <label>Ім'я</label>
              <input type="text" :value="admin?.name || ''" disabled />
            </div>
            <div class="field-col">
              <label>Прізвище</label>
              <input type="text" :value="admin?.last_name || ''" disabled />
            </div>
          </div>
          <div class="fields-row">
            <div class="field-col">
              <label>Email</label>
              <input type="text" :value="admin?.email || ''" disabled />
            </div>
            <div class="field-col phone-group">
              <label>Номер телефону</label>
              <div class="phone-fields">
                <input type="text" :value="admin?.country_code || '+380'" class="phone-code" disabled />
                <input type="text" :value="admin?.phone_number || ''" class="phone-number" disabled />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="admin-detail-sections">
        <div class="section-block">
          <h3>Активність</h3>
        </div>
      </div>
      <div class="admin-detail-actions">
        <v-btn
          v-if="admin && admin.role?.name !== 'super_admin'"
          color="error"
          class="deactivate-btn"
          @click="deactivateAdmin"
        >
          Деактивація адміністратора
        </v-btn>
      </div>
    </div>
    <AdminEditModal
      :isEditModalOpen="isEditModalOpen"
      :admin="admin"
      :title="'Редагування адміністратора'"
      @close="isEditModalOpen = false"
      @save="saveAdmin"
    />
  </div>
</template>

<script>
import { studentsApi } from '@/services/api.js';
import AdminEditModal from './AdminEditModal.vue';

export default {
  name: 'AdminDetailPage',
  components: { AdminEditModal },
  data() {
    return {
      admin: null,
      loading: true,
      isEditModalOpen: false,
    };
  },
  methods: {
    async fetchAdmin() {
      this.loading = true;
      try {
        const res = await studentsApi.getStudentById(this.$route.params.id);
        this.admin = res.data?.user || res.data;
      } finally {
        this.loading = false;
      }
    },
    getInitials(user) {
      if (!user) return '';
      const n = (user.name || '').charAt(0);
      const l = (user.last_name || '').charAt(0);
      return `${n}${l}`.toUpperCase();
    },
    formatDate(dateStr) {
      if (!dateStr) return '-';
      const d = new Date(dateStr);
      return d.toLocaleDateString('uk-UA');
    },
    async deactivateAdmin() {
      if (!this.admin?.id) return;
      if (!confirm('Ви впевнені, що хочете деактивувати цього адміністратора?')) return;
      try {
        await studentsApi.deactivateStudent(this.admin.id);
        this.$router.push('/admin/administrators');
      } catch (e) {
        alert('Помилка при деактивації адміністратора');
      }
    },
    async saveAdmin(updatedData) {
      try {
        await studentsApi.updateStudent(updatedData.id, updatedData);
        this.isEditModalOpen = false;
        this.fetchAdmin();
      } catch (e) {
        alert('Помилка при збереженні даних користувача');
      }
    },
  },
  mounted() {
    this.fetchAdmin();
  },
};
</script>

<style scoped>
.admin-detail-wrapper {
  padding: 32px 0 0 0;
  max-width: 1100px;
  margin: 0 auto;
}
.admin-detail-breadcrumbs {
  margin-bottom: 18px;
  font-size: 16px;
  color: #443bc9;
  display: flex;
  align-items: center;
}
.crumb { color: #443bc9; text-decoration: none; }
.crumb-sep { margin: 0 8px; color: #888; }
.admin-detail-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  padding: 32px 32px 24px 32px;
}
.admin-detail-main {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}
.admin-detail-left {
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24px;
}
.avatar-big {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #443bc9;
  margin-bottom: 10px;
}
.photo-label {
  color: #888;
  font-size: 15px;
  margin-bottom: 8px;
}
.reg-date {
  color: #888;
  font-size: 14px;
}
.admin-detail-right {
  flex: 1;
  position: relative;
}
.edit-btn-wrapper {
  position: absolute;
  top: 0;
  right: 0;
}
.edit-btn {
  min-width: 48px;
  min-height: 48px;
  border-radius: 12px;
  box-shadow: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fields-row {
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
}
.field-col {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.field-col label {
  font-size: 15px;
  color: #222;
  margin-bottom: 6px;
  font-weight: 500;
}
.field-col input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e1e1e1;
  border-radius: 6px;
  background: #f9fafb;
  font-size: 16px;
  color: #222;
}
.phone-group .phone-fields {
  display: flex;
  gap: 8px;
}
.phone-code {
  width: 60px;
  min-width: 60px;
  max-width: 80px;
}
.phone-number {
  flex: 1;
}
.admin-detail-sections {
  display: flex;
  gap: 48px;
  margin-top: 32px;
}
.section-block {
  flex: 1;
}
.section-block h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.admin-detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
}
.deactivate-btn {
  min-width: 220px;
  font-size: 16px;
  font-weight: 500;
}
</style> 