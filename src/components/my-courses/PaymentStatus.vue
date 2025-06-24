<template>
  <div class="payment-status">
    <div v-if="loading" class="loading">
      <v-icon class="loading-icon">mdi-loading</v-icon>
      Перевірка статусу платежу...
    </div>
    <div v-else-if="error" class="error">
      <v-icon>mdi-alert-circle</v-icon>
      {{ error }}
      <button @click="checkStatus" class="retry-btn">Спробувати знову</button>
    </div>
    <div v-else class="status-content">
      <!-- Успішний платіж -->
      <div v-if="status === 'completed'" class="status-success">
        <div class="status-icon">
          <v-icon>mdi-check-circle</v-icon>
        </div>
        <h3>Оплата успішна!</h3>
        <p>Ваш платіж був успішно оброблений. Тепер ви маєте доступ до курсу.</p>
        <div class="payment-details">
          <div class="detail-item">
            <span class="label">Платіж ID:</span>
            <span class="value">{{ paymentId }}</span>
          </div>
          <div class="detail-item" v-if="paymentData?.amount">
            <span class="label">Сума:</span>
            <span class="value">{{ formatCurrency(paymentData.amount) }}</span>
          </div>
          <div class="detail-item" v-if="paymentData?.course?.title">
            <span class="label">Курс:</span>
            <span class="value">{{ paymentData.course.title }}</span>
          </div>
        </div>
        <button @click="goToCourse" class="go-course-btn">
          <v-icon>mdi-book-open</v-icon>
          Перейти до курсу
        </button>
      </div>

      <!-- Невдалий платіж -->
      <div v-else-if="status === 'failed'" class="status-failed">
        <div class="status-icon">
          <v-icon>mdi-close-circle</v-icon>
        </div>
        <h3>Платіж не пройшов</h3>
        <p>На жаль, ваш платіж не був оброблений. Спробуйте ще раз або зверніться до підтримки.</p>
        <div class="payment-details">
          <div class="detail-item">
            <span class="label">Платіж ID:</span>
            <span class="value">{{ paymentId }}</span>
          </div>
          <div class="detail-item" v-if="paymentData?.amount">
            <span class="label">Сума:</span>
            <span class="value">{{ formatCurrency(paymentData.amount) }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button @click="retryPayment" class="retry-payment-btn">
            <v-icon>mdi-refresh</v-icon>
            Спробувати знову
          </button>
          <button @click="goToCourses" class="go-courses-btn">
            <v-icon>mdi-arrow-left</v-icon>
            Повернутися до курсів
          </button>
        </div>
      </div>

      <!-- Платіж в обробці -->
      <div v-else-if="status === 'pending'" class="status-pending">
        <div class="status-icon">
          <v-icon>mdi-clock-outline</v-icon>
        </div>
        <h3>Платіж в обробці</h3>
        <p>Ваш платіж обробляється. Це може зайняти кілька хвилин.</p>
        <div class="payment-details">
          <div class="detail-item">
            <span class="label">Платіж ID:</span>
            <span class="value">{{ paymentId }}</span>
          </div>
          <div class="detail-item" v-if="paymentData?.amount">
            <span class="label">Сума:</span>
            <span class="value">{{ formatCurrency(paymentData.amount) }}</span>
          </div>
        </div>
        <div class="auto-refresh">
          <p>Автоматична перевірка через {{ countdown }} сек</p>
          <button @click="checkStatus" class="manual-check-btn">
            <v-icon>mdi-refresh</v-icon>
            Перевірити зараз
          </button>
        </div>
      </div>

      <!-- Відхилений платіж -->
      <div v-else-if="status === 'rejected'" class="status-rejected">
        <div class="status-icon">
          <v-icon>mdi-cancel</v-icon>
        </div>
        <h3>Платіж відхилено</h3>
        <p>Ваш платіж був відхилений адміністратором.</p>
        <div class="payment-details">
          <div class="detail-item">
            <span class="label">Платіж ID:</span>
            <span class="value">{{ paymentId }}</span>
          </div>
          <div class="detail-item" v-if="paymentData?.rejection_reason">
            <span class="label">Причина:</span>
            <span class="value">{{ paymentData.rejection_reason }}</span>
          </div>
        </div>
        <button @click="goToCourses" class="go-courses-btn">
          <v-icon>mdi-arrow-left</v-icon>
          Повернутися до курсів
        </button>
      </div>

      <!-- Невідомий статус -->
      <div v-else class="status-unknown">
        <div class="status-icon">
          <v-icon>mdi-help-circle</v-icon>
        </div>
        <h3>Невідомий статус платежу</h3>
        <p>Не вдалося визначити статус платежу. Зверніться до підтримки.</p>
        <div class="payment-details">
          <div class="detail-item">
            <span class="label">Платіж ID:</span>
            <span class="value">{{ paymentId }}</span>
          </div>
        </div>
        <button @click="checkStatus" class="retry-btn">
          <v-icon>mdi-refresh</v-icon>
          Перевірити статус
        </button>
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
      status: null,
      paymentData: null,
      countdown: 30,
      countdownInterval: null
    };
  },
  created() {
    this.checkStatus();
  },
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  },
  methods: {
    async checkStatus() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await checkPaymentStatus(this.paymentId);
        this.status = resp.payment?.payment_status || resp.status;
        this.paymentData = resp.payment || resp;
        
        // Показуємо повідомлення про зміну статусу
        if (this.status === 'completed') {
          this.$toast.success('Платіж підтверджено! Тепер ви маєте доступ до курсу.');
          this.stopAutoRefresh();
        } else if (this.status === 'rejected') {
          this.$toast.error('Платіж відхилено адміністратором.');
          this.stopAutoRefresh();
        } else if (this.status === 'failed') {
          this.$toast.error('Платіж не пройшов. Спробуйте ще раз.');
          this.stopAutoRefresh();
        }
        
        this.loading = false;
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Помилка перевірки статусу';
        this.$toast.error(this.error);
        this.loading = false;
      }
    },

    startAutoRefresh() {
      this.countdown = 30;
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.checkStatus();
          this.countdown = 30;
        }
      }, 1000);
    },

    stopAutoRefresh() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    },

    retryPayment() {
      this.$router.push(`/payment/${this.courseId}`);
    },

    goToCourse() {
      this.$router.push(`/my-courses/${this.courseId}`);
    },

    goToCourses() {
      this.$router.push('/courses');
    },

    formatCurrency(amount) {
      if (!amount) return '0 ₴';
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH'
      }).format(amount);
    }
  },
  watch: {
    status(newStatus) {
      if (newStatus === 'pending') {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
  }
}
</script>

<style scoped>
.payment-status {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  font-size: 32px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 20px;
  color: #dc2626;
  background-color: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.error v-icon {
  margin-bottom: 8px;
  font-size: 24px;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #443bc9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px auto 0;
}

.retry-btn:hover {
  background-color: #3a32a8;
}

.status-content {
  text-align: center;
  padding: 20px 0;
}

.status-icon {
  margin-bottom: 16px;
}

.status-icon v-icon {
  font-size: 48px;
}

.status-success .status-icon v-icon {
  color: #10b981;
}

.status-failed .status-icon v-icon {
  color: #ef4444;
}

.status-pending .status-icon v-icon {
  color: #f59e0b;
}

.status-rejected .status-icon v-icon {
  color: #6b7280;
}

.status-unknown .status-icon v-icon {
  color: #6b7280;
}

.status-content h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.status-content p {
  margin: 0 0 20px 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
}

.payment-details {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: left;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  font-weight: 500;
  color: #374151;
}

.detail-item .value {
  color: #111827;
  font-weight: 600;
}

.go-course-btn,
.retry-payment-btn,
.go-courses-btn,
.manual-check-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.2s;
}

.go-course-btn {
  background-color: #10b981;
  color: white;
}

.go-course-btn:hover {
  background-color: #059669;
}

.retry-payment-btn {
  background-color: #443bc9;
  color: white;
}

.retry-payment-btn:hover {
  background-color: #3a32a8;
}

.go-courses-btn {
  background-color: #6b7280;
  color: white;
}

.go-courses-btn:hover {
  background-color: #4b5563;
}

.manual-check-btn {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.manual-check-btn:hover {
  background-color: #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.auto-refresh {
  margin-top: 16px;
  padding: 16px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
}

.auto-refresh p {
  margin: 0 0 12px 0;
  color: #0369a1;
  font-size: 14px;
}

@media (max-width: 768px) {
  .payment-status {
    margin: 10px;
    padding: 16px;
  }
  
  .status-content h3 {
    font-size: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons button {
    width: 100%;
  }
}
</style> 