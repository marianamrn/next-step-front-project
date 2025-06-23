<template>
  <div class="liqpay-payment">
    <div v-if="loading" class="loading">Завантаження...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-html="liqpayForm"></div>
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
      paymentId: null
    };
  },
  async created() {
    this.loading = true;
    this.error = null;
    try {
      const resp = await initiateCoursePayment(this.courseId);
      this.paymentId = resp.payment_id;
      if (resp.liqpay_data && resp.liqpay_data.data) {
        this.liqpayForm = resp.liqpay_data.data;
      } else if (resp.liqpay_data && resp.liqpay_data.url && resp.liqpay_data.params) {
        this.liqpayForm = `
          <form method="POST" action="${resp.liqpay_data.url}">
            <input type="hidden" name="data" value="${resp.liqpay_data.params.data}" />
            <input type="hidden" name="signature" value="${resp.liqpay_data.params.signature}" />
            <button type="submit">Оплатити</button>
          </form>
        `;
      } else {
        this.error = 'Помилка: не вдалося отримати форму LiqPay';
      }
      this.loading = false;
    } catch (e) {
      this.error = e?.message || 'Помилка ініціалізації оплати';
      this.loading = false;
    }
  }
}
</script>

<style scoped>
.liqpay-payment {
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
</style> 