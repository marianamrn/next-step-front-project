<template>
  <div class="admin-detail-page">
    <v-btn text @click="goBack">Назад</v-btn>
    <h2>Деталі адміністратора</h2>
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <p>Завантаження...</p>
    </div>
    <div v-else>
      <div class="info-row"><span class="label">Ім'я:</span> <span>{{ admin?.name || '-' }}</span></div>
      <div class="info-row"><span class="label">Прізвище:</span> <span>{{ admin?.last_name || '-' }}</span></div>
      <div class="info-row"><span class="label">Email:</span> <span>{{ admin?.email || '-' }}</span></div>
      <div class="info-row"><span class="label">Код країни:</span> <span>{{ admin?.country_code || '-' }}</span></div>
      <div class="info-row"><span class="label">Номер телефону:</span> <span>{{ admin?.phone_number || '-' }}</span></div>
      <div class="info-row"><span class="label">Роль:</span> <span>{{ admin?.role?.name || '-' }}</span></div>
    </div>
  </div>
</template>

<script>
import { studentsApi } from '@/services/api.js';

export default {
  name: 'AdminDetailPage',
  data() {
    return {
      admin: null,
      loading: true,
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
    goBack() {
      this.$router.push('/admin/administrators');
    },
  },
  mounted() {
    this.fetchAdmin();
  },
};
</script>

<style scoped>
.admin-detail-page { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 32px; }
.info-row { display: flex; margin-bottom: 14px; }
.label { width: 140px; color: #888; font-weight: 500; }
.loading-indicator { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; }
.spinner { border: 4px solid #f3f3f3; border-top: 4px solid #443bc9; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style> 