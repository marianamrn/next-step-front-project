<template>
  <div class="liqpay-payment">
    <div v-if="loading" class="loading">
      <v-icon class="loading-icon">mdi-loading</v-icon>
      Ініціалізація оплати...
    </div>
    <div v-else-if="error" class="error">
      <v-icon>mdi-alert-circle</v-icon>
      {{ error }}
      <button @click="retryInitiation" class="retry-btn">Спробувати знову</button>
    </div>
    <div v-else class="payment-content">
      <div class="payment-header">
        <h2>Оплата курсу</h2>
        <p>Курс: <strong>{{ courseTitle }}</strong></p>
        <p>Сума: <strong>{{ formatCurrency(amount) }}</strong></p>
      </div>
      
      <div class="payment-form">
        <div v-if="liqpayForm" v-html="liqpayForm"></div>
        <div v-else class="manual-form">
          <p>Не вдалося отримати форму LiqPay для оплати.</p>
        </div>
      </div>
      
      <div class="payment-info">
        <h3>Інформація про оплату:</h3>
        <ul>
          <li>Після успішної оплати ви будете перенаправлені на сторінку курсу</li>
          <li>Якщо виникли проблеми, зверніться до адміністратора</li>
          <li>Платіж ID: <strong>{{ paymentId }}</strong></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { initiateCoursePayment } from '../../services/api';

export default {
  props: {
    courseId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      liqpayForm: null,
      paymentId: null,
      courseTitle: '',
      amount: 0,
      liqpayData: null
    };
  },
  async created() {
    await this.initiatePayment();
  },
  methods: {
    async initiatePayment() {
      this.loading = true;
      this.error = null;
      try {
        const resp = await initiateCoursePayment(this.courseId);
        this.paymentId = resp.payment?.id || resp.payment_id;
        this.courseTitle = resp.course?.title || resp.payment?.course?.title || 'Невідомий курс';
        this.amount = resp.amount || resp.payment?.amount || resp.course?.price || 0;
        // Підтримка liqpay, liqpay_data, data
        this.liqpayData = resp.liqpay || resp.liqpay_data || resp.data;

        // Якщо є form_html — рендеримо його
        if (this.liqpayData && this.liqpayData.form_html) {
          this.liqpayForm = this.liqpayData.form_html;
          this.loading = false;
          // Автоматично сабмітити форму не потрібно — користувач сам натисне
          return;
        }
        // Якщо є url + data + signature — будуємо форму вручну
        if (this.liqpayData && (this.liqpayData.url && (this.liqpayData.data || (this.liqpayData.params && this.liqpayData.params.data)))) {
          this.liqpayForm = this.createLiqPayForm(this.liqpayData);
          this.loading = false;
          return;
        }
        // Якщо нічого немає — показуємо помилку
        this.error = 'Не вдалося отримати форму LiqPay для оплати. Спробуйте пізніше або зверніться до адміністратора.';
        this.loading = false;
      } catch (e) {
        this.error = e?.response?.data?.message || e?.message || 'Помилка ініціалізації оплати';
        this.$toast?.error?.(this.error);
        this.loading = false;
      }
    },
    createLiqPayForm(liqpayData) {
      const url = liqpayData.url;
      const data = liqpayData.data || (liqpayData.params && liqpayData.params.data);
      const signature = liqpayData.signature || (liqpayData.params && liqpayData.params.signature);
      return `
        <form method="POST" action="${url}" accept-charset="utf-8">
          <input type="hidden" name="data" value="${data}" />
          <input type="hidden" name="signature" value="${signature}" />
          <button type="submit" class="liqpay-submit-btn">Оплатити ${this.formatCurrency(this.amount)}</button>
        </form>
      `;
    },
    retryInitiation() {
      this.initiatePayment();
    },
    formatCurrency(amount) {
      if (!amount) return '0 ₴';
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH'
      }).format(amount);
    }
  }
}
</script>

<style scoped>
.liqpay-payment {
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
}

.retry-btn:hover {
  background-color: #3a32a8;
}

.payment-content {
  padding: 20px 0;
}

.payment-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.payment-header h2 {
  margin: 0 0 12px 0;
  color: #111827;
  font-size: 24px;
  font-weight: 600;
}

.payment-header p {
  margin: 4px 0;
  color: #6b7280;
  font-size: 16px;
}

.payment-header strong {
  color: #111827;
}

.payment-form {
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.manual-form {
  text-align: center;
}

.manual-pay-btn {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px auto 0;
}

.manual-pay-btn:hover {
  background-color: #059669;
}

.payment-button-container {
  text-align: center;
}

.liqpay-submit-btn {
  padding: 12px 24px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.liqpay-submit-btn:hover {
  background-color: #059669;
}

.payment-info {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
}

.payment-info h3 {
  margin: 0 0 12px 0;
  color: #0369a1;
  font-size: 16px;
  font-weight: 600;
}

.payment-info ul {
  margin: 0;
  padding-left: 20px;
  color: #0c4a6e;
}

.payment-info li {
  margin-bottom: 4px;
}

.payment-info strong {
  color: #0369a1;
}

/* Стилі для LiqPay форми */
:deep(#liqpay-form) {
  margin: 0;
}

:deep(.liqpay-submit-btn) {
  padding: 12px 24px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

:deep(.liqpay-submit-btn:hover) {
  background-color: #059669;
}

/* Стилі для pending payment форми */
:deep(.pending-payment-info) {
  text-align: center;
  padding: 30px 20px;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
}

:deep(.pending-icon) {
  margin-bottom: 16px;
}

:deep(.pending-icon v-icon) {
  font-size: 48px;
  color: #f59e0b;
}

:deep(.pending-payment-info h3) {
  margin: 0 0 12px 0;
  color: #0369a1;
  font-size: 20px;
  font-weight: 600;
}

:deep(.pending-payment-info p) {
  margin: 0 0 20px 0;
  color: #0c4a6e;
  font-size: 16px;
  line-height: 1.5;
}

:deep(.payment-id-info) {
  background-color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

:deep(.check-status-btn) {
  padding: 12px 24px;
  background-color: #443bc9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: background-color 0.2s;
}

:deep(.check-status-btn:hover) {
  background-color: #3a32a8;
}

@media (max-width: 768px) {
  .liqpay-payment {
    margin: 10px;
    padding: 16px;
  }
  
  .payment-header h2 {
    font-size: 20px;
  }
  
  .payment-form {
    padding: 16px;
  }
}
</style> 