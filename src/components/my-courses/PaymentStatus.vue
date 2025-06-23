<template>
  <div class="payment-status">
    <div v-if="loading" class="loading">Перевірка статусу платежу...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="status === 'completed'">
        <h3>Оплата успішна!</h3>
        <button @click="goToCourse" class="go-course-btn">Перейти до курсу</button>
      </div>
      <div v-else-if="status === 'failed'">
        <h3>Платіж не пройшов</h3>
        <button @click="checkStatus" class="refresh-btn">Спробувати знову</button>
      </div>
      <div v-else>
        <h3>Платіж в обробці</h3>
        <button @click="checkStatus" class="refresh-btn">Оновити статус</button>
      </div>
    </div>
  </div>
</template>

<script>
import { checkPaymentStatus } from '../../services/api';
export default {
  props: {
    paymentId: {
      type: [Number, String],
      required: true
    },
    courseId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      status: null
    };
  },
  created() {
    this.checkStatus();
  },
  methods: {
    async checkStatus() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await checkPaymentStatus(this.paymentId);
        this.status = resp.payment?.payment_status;
        this.loading = false;
      } catch (e) {
        this.error = e?.message || 'Помилка перевірки статусу';
        this.loading = false;
      }
    },
    goToCourse() {
      this.$router.push(`/my-courses/${this.courseId}`);
    }
  }
}
</script>

<style scoped>
.payment-status {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.loading {
  text-align: center;
  padding: 20px 0;
}
.error {
  color: red;
  padding: 15px;
  background-color: #ffebee;
  border-radius: 4px;
  text-align: center;
}
.go-course-btn, .refresh-btn {
  background-color: #1db6b8;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
}
.go-course-btn:hover, .refresh-btn:hover {
  background-color: #17a2a4;
}
</style> 