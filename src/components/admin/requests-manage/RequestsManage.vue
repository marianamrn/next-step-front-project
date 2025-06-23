<template>
  <div class="requests-manage">
    <h2>Запити на доступ до курсів</h2>
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <StudentRequests
        :requests="requests"
        @approve-request="handleApprove"
        @reject-request="handleReject"
        @view-request="handleView"
      />
      <div v-if="message" :class="['message', message.type]">{{ message.text }}</div>
    </div>
  </div>
</template>

<script>
import StudentRequests from '../students/StudentRequests.vue';
import { studentsApi } from '@/services/api';
export default {
  name: 'RequestsManage',
  components: { StudentRequests },
  data() {
    return {
      loading: true,
      error: null,
      requests: [],
      message: null
    };
  },
  async created() {
    await this.loadRequests();
  },
  methods: {
    async loadRequests() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await studentsApi.getRequests('pending');
        this.requests = resp.data?.requests || [];
      } catch (e) {
        this.error = e?.message || 'Помилка завантаження запитів';
      } finally {
        this.loading = false;
      }
    },
    async handleApprove(request) {
      try {
        await studentsApi.approveRequest(request.id);
        this.message = { type: 'success', text: 'Доступ надано!' };
        await this.loadRequests();
      } catch (e) {
        this.message = { type: 'error', text: e?.message || 'Помилка підтвердження' };
      }
    },
    async handleReject(request) {
      try {
        await studentsApi.rejectRequest(request.id);
        this.message = { type: 'success', text: 'Запит відхилено.' };
        await this.loadRequests();
      } catch (e) {
        this.message = { type: 'error', text: e?.message || 'Помилка відхилення' };
      }
    },
    handleView(request) {
      // Можна реалізувати модалку з деталями запиту
      alert(`Запит від: ${request.firstName} ${request.lastName}\nEmail: ${request.email}`);
    }
  }
}
</script>

<style scoped>
.requests-manage {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 12px;
}
.loading, .error {
  text-align: center;
  margin: 40px 0;
  font-size: 18px;
}
.message {
  margin-top: 24px;
  padding: 12px 20px;
  border-radius: 6px;
  font-size: 16px;
  text-align: center;
}
.message.success {
  background: #e0f7fa;
  color: #00796b;
}
.message.error {
  background: #ffebee;
  color: #c62828;
}
</style> 