<template>
  <div class="financial-module">
    <div class="page-header">
      <h1>Управління платежами</h1>
      <div class="header-actions">
        <button @click="refreshPayments" class="refresh-btn">
          <v-icon>mdi-refresh</v-icon>
          Оновити
        </button>
      </div>
    </div>

    <!-- Фільтри -->
    <div class="filters-section">
      <div class="filter-row">
        <div class="filter-group">
          <label>Статус:</label>
          <select v-model="filters.status" @change="applyFilters">
            <option value="">Всі статуси</option>
            <option value="pending">Очікує підтвердження</option>
            <option value="completed">Завершено</option>
            <option value="failed">Невдалий</option>
            <option value="rejected">Відхилено</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Дата від:</label>
          <input type="date" v-model="filters.date_from" @change="applyFilters" />
        </div>
        <div class="filter-group">
          <label>Дата до:</label>
          <input type="date" v-model="filters.date_to" @change="applyFilters" />
        </div>
        <div class="filter-group">
          <label>Пошук:</label>
          <input
            type="text"
            v-model="filters.search"
            @input="debounceSearch"
            placeholder="ID, email, ім'я користувача, назва курсу..."
          />
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="statistics-section" v-if="statistics">
      <div class="stat-card">
        <div class="stat-number">{{ statistics.total_payments }}</div>
        <div class="stat-label">Всього платежів</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.pending_payments }}</div>
        <div class="stat-label">Очікують підтвердження</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ statistics.completed_payments }}</div>
        <div class="stat-label">Завершено</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ formatCurrency(statistics.total_revenue) }}</div>
        <div class="stat-label">Загальний дохід</div>
      </div>
    </div>

    <!-- Список платежів -->
    <div class="payments-list">
      <div v-if="loading" class="loading">
        <v-icon class="loading-icon">mdi-loading</v-icon>
        Завантаження платежів...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
        <button @click="loadPayments" class="retry-btn">Спробувати знову</button>
      </div>

      <div v-else-if="payments.length === 0" class="empty-state">
        <v-icon>mdi-credit-card-off</v-icon>
        <p>Платежів не знайдено</p>
      </div>

      <div v-else class="payments-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Користувач</th>
              <th>Курс</th>
              <th>Сума</th>
              <th>Спосіб оплати</th>
              <th>Статус</th>
              <th>Дата створення</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ payment.id }}</td>
              <td>
                <div class="user-info">
                  <div class="user-name">
                    {{ payment.user_name || payment.user?.name || 'Невідомий користувач' }}
                  </div>
                  <div class="user-email">{{ payment.user?.email }}</div>
                </div>
              </td>
              <td>
                <div class="course-info">
                  <div class="course-title">
                    {{ payment.course_info?.title || 'Невідомий курс' }}
                  </div>
                  <div class="course-price">{{ formatCurrency(payment.course_info?.price) }}</div>
                </div>
              </td>
              <td class="amount">{{ formatCurrency(payment.amount) }}</td>
              <td class="payment-method">{{ getPaymentMethodText(payment.payment_method) }}</td>
              <td>
                <span :class="['status-badge', `status-${payment.payment_status}`]">
                  {{ getStatusText(payment.payment_status) }}
                </span>
              </td>
              <td>{{ formatDate(payment.created_at) }}</td>
              <td>
                <div class="actions">
                  <button
                    v-if="payment.payment_status === 'pending'"
                    @click="confirmPayment(payment.id)"
                    class="action-btn confirm-btn"
                    title="Підтвердити платіж"
                  >
                    <v-icon>mdi-check</v-icon>
                  </button>
                  <button
                    v-if="payment.payment_status === 'pending'"
                    @click="rejectPayment(payment.id)"
                    class="action-btn reject-btn"
                    title="Відхилити платіж"
                  >
                    <v-icon>mdi-close</v-icon>
                  </button>
                  <button
                    @click="viewPaymentDetails(payment.id)"
                    class="action-btn view-btn"
                    title="Деталі платежу"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагінація -->
      <div v-if="pagination && pagination.total_pages > 1" class="pagination">
        <button
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page <= 1"
          class="page-btn"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </button>

        <span class="page-info">
          Сторінка {{ pagination.current_page }} з {{ pagination.total_pages }}
        </span>

        <button
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page >= pagination.total_pages"
          class="page-btn"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </button>
      </div>
    </div>

    <!-- Модальне вікно деталей платежу -->
    <div v-if="showPaymentModal" class="modal-overlay" @click="closePaymentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Деталі платежу #{{ selectedPayment?.id }}</h3>
          <button @click="closePaymentModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </button>
        </div>
        <div class="modal-body" v-if="selectedPayment">
          <div class="detail-row">
            <label>Користувач:</label>
            <span
              >{{ selectedPayment.user_name || selectedPayment.user?.name }} ({{
                selectedPayment.user?.email
              }})</span
            >
          </div>
          <div class="detail-row">
            <label>Курс:</label>
            <span>{{ selectedPayment.course_info?.title }}</span>
          </div>
          <div class="detail-row">
            <label>Сума:</label>
            <span>{{ formatCurrency(selectedPayment.amount) }}</span>
          </div>
          <div class="detail-row">
            <label>Статус:</label>
            <span :class="['status-badge', `status-${selectedPayment.payment_status}`]">
              {{ getStatusText(selectedPayment.payment_status) }}
            </span>
          </div>
          <div class="detail-row">
            <label>Дата створення:</label>
            <span>{{ formatDate(selectedPayment.created_at) }}</span>
          </div>
          <div class="detail-row" v-if="selectedPayment.updated_at">
            <label>Дата оновлення:</label>
            <span>{{ formatDate(selectedPayment.updated_at) }}</span>
          </div>
          <div class="detail-row" v-if="selectedPayment.transaction_id">
            <label>ID транзакції:</label>
            <span>{{ selectedPayment.transaction_id }}</span>
          </div>
          <div class="detail-row" v-if="selectedPayment.payment_method">
            <label>Спосіб оплати:</label>
            <span>{{ getPaymentMethodText(selectedPayment.payment_method) }}</span>
          </div>
          <div class="detail-row" v-if="selectedPayment.currency">
            <label>Валюта:</label>
            <span>{{ selectedPayment.currency }}</span>
          </div>
          <div
            class="detail-row"
            v-if="
              selectedPayment.discount_amount && parseFloat(selectedPayment.discount_amount) > 0
            "
          >
            <label>Знижка:</label>
            <span>{{ formatCurrency(selectedPayment.discount_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальне вікно підтвердження дії -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ confirmModalTitle }}</h3>
          <button @click="closeConfirmModal" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ confirmModalMessage }}</p>
          <div v-if="showRejectReason" class="form-group">
            <label>Причина відхилення:</label>
            <textarea
              v-model="rejectReason"
              placeholder="Вкажіть причину відхилення платежу"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="cancel-btn">Скасувати</button>
          <button @click="executeConfirmAction" class="confirm-btn">
            {{ confirmModalActionText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getAdminPayments,
  confirmPayment,
  rejectPayment,
  getPaymentDetails,
  getPaymentStatistics,
} from '../../services/api'

export default {
  name: 'FinancialModule',
  data() {
    return {
      loading: false,
      error: null,
      payments: [],
      statistics: null,
      pagination: null,
      filters: {
        status: '',
        date_from: '',
        date_to: '',
        search: '',
      },
      showPaymentModal: false,
      showConfirmModal: false,
      selectedPayment: null,
      confirmModalTitle: '',
      confirmModalMessage: '',
      confirmModalActionText: '',
      confirmModalAction: null,
      showRejectReason: false,
      rejectReason: '',
      searchTimeout: null,
    }
  },
  async created() {
    await this.loadPayments(this.filters)
    await this.loadStatistics()
  },
  methods: {
    async loadPayments(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await getAdminPayments(filters, this.pagination?.current_page || 1)
        this.payments = data.data || []
        this.pagination = {
          current_page: data.current_page,
          total_pages: data.last_page,
          total_items: data.total,
          per_page: data.per_page,
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message || error?.message || 'Помилка завантаження платежів'
      } finally {
        this.loading = false
      }
    },

    async loadStatistics() {
      try {
        const data = await getPaymentStatistics()
        this.statistics = data.statistics || data
      } catch (error) {
        console.error('Помилка завантаження статистики:', error)
      }
    },

    async refreshPayments() {
      await this.loadPayments(this.filters)
      await this.loadStatistics()
    },

    applyFilters() {
      this.pagination = null

      // Створюємо об'єкт фільтрів з правильними назвами параметрів
      const apiFilters = {}

      if (this.filters.status) {
        apiFilters.status = this.filters.status
      }

      if (this.filters.date_from) {
        apiFilters.date_from = this.filters.date_from
      }

      if (this.filters.date_to) {
        apiFilters.date_to = this.filters.date_to
      }

      // Спробуємо різні варіанти параметра пошуку
      if (this.filters.search) {
        // Спочатку спробуємо 'query' (найбільш поширений)
        apiFilters.query = this.filters.search
        // Також спробуємо 'search'
        apiFilters.search = this.filters.search
        // І 'q' (загальний пошук)
        apiFilters.q = this.filters.search
        // І 'email' якщо це виглядає як email
        if (this.filters.search.includes('@')) {
          apiFilters.email = this.filters.search
          apiFilters.user_email = this.filters.search
        }
        // Спробуємо також пошук по імені користувача
        apiFilters.user_name = this.filters.search
        apiFilters.user = this.filters.search
        // І пошук по назві курсу
        apiFilters.course_title = this.filters.search
        apiFilters.course = this.filters.search
      }

      console.log('Applied filters:', apiFilters)
      this.loadPayments(apiFilters)
    },

    debounceSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.applyFilters()
      }, 500)
    },

    async changePage(page) {
      if (page >= 1 && page <= this.pagination.total_pages) {
        this.pagination.current_page = page
        await this.loadPayments(this.filters)
      }
    },

    async confirmPayment(paymentId) {
      this.confirmModalTitle = 'Підтвердження платежу'
      this.confirmModalMessage =
        'Ви впевнені, що хочете підтвердити цей платіж? Користувач отримає доступ до курсу.'
      this.confirmModalActionText = 'Підтвердити'
      this.confirmModalAction = async () => {
        try {
          await confirmPayment(paymentId)
          this.$toast.success('Платіж підтверджено успішно')
          await this.refreshPayments()
        } catch (error) {
          this.$toast.error(
            error?.response?.data?.message || error?.message || 'Помилка підтвердження платежу',
          )
        }
        this.closeConfirmModal()
      }
      this.showConfirmModal = true
    },

    async rejectPayment(paymentId) {
      this.confirmModalTitle = 'Відхилення платежу'
      this.confirmModalMessage = 'Ви впевнені, що хочете відхилити цей платіж?'
      this.confirmModalActionText = 'Відхилити'
      this.showRejectReason = true
      this.confirmModalAction = async () => {
        try {
          await rejectPayment(paymentId, this.rejectReason)
          this.$toast.success('Платіж відхилено успішно')
          await this.refreshPayments()
        } catch (error) {
          this.$toast.error(
            error?.response?.data?.message || error?.message || 'Помилка відхилення платежу',
          )
        }
        this.closeConfirmModal()
      }
      this.showConfirmModal = true
    },

    async viewPaymentDetails(paymentId) {
      try {
        // Знаходимо платіж у поточному списку
        const payment = this.payments.find((p) => p.id === paymentId)
        if (payment) {
          this.selectedPayment = payment
          this.showPaymentModal = true
        } else {
          // Якщо платіж не знайдено в списку, робимо API запит
          const data = await getPaymentDetails(paymentId)
          this.selectedPayment = data.payment || data
          this.showPaymentModal = true
        }
      } catch (error) {
        this.$toast.error(
          error?.response?.data?.message ||
            error?.message ||
            'Помилка завантаження деталей платежу',
        )
      }
    },

    closePaymentModal() {
      this.showPaymentModal = false
      this.selectedPayment = null
    },

    closeConfirmModal() {
      this.showConfirmModal = false
      this.confirmModalTitle = ''
      this.confirmModalMessage = ''
      this.confirmModalActionText = ''
      this.confirmModalAction = null
      this.showRejectReason = false
      this.rejectReason = ''
    },

    executeConfirmAction() {
      if (this.confirmModalAction) {
        this.confirmModalAction()
      }
    },

    getStatusText(status) {
      const statusMap = {
        pending: 'Очікує підтвердження',
        completed: 'Завершено',
        failed: 'Невдалий',
        rejected: 'Відхилено',
      }
      return statusMap[status] || status
    },

    getPaymentMethodText(method) {
      const methodMap = {
        liqpay: 'LiqPay',
        card: 'Банківська карта',
        paypal: 'PayPal',
        bank_transfer: 'Банківський переказ',
      }
      return methodMap[method] || method
    },

    formatCurrency(amount) {
      if (!amount) return '0 ₴'
      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
      }).format(amount)
    },

    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('uk-UA')
    },

    testSearchParams() {
      if (!this.filters.search) {
        this.$toast.warning('Введіть текст для пошуку')
        return
      }

      // Тестуємо різні параметри пошуку
      const testParams = [
        { query: this.filters.search },
        { search: this.filters.search },
        { q: this.filters.search },
        { email: this.filters.search },
        { user_email: this.filters.search },
        { user_name: this.filters.search },
        { user: this.filters.search },
        { course_title: this.filters.search },
        { course: this.filters.search },
      ]

      console.log('Testing search parameters:', testParams)

      // Тестуємо перший параметр
      this.testSearchWithParams(testParams[0])
    },

    async testSearchWithParams(params) {
      try {
        console.log('Testing with params:', params)
        const data = await getAdminPayments(params, 1, 15)
        console.log('Search result:', data)

        if (data.data && data.data.length > 0) {
          this.$toast.success(
            `Знайдено ${data.data.length} платежів з параметрами: ${Object.keys(params).join(', ')}`,
          )
          this.payments = data.data
          this.pagination = {
            current_page: data.current_page,
            total_pages: data.last_page,
            total_items: data.total,
            per_page: data.per_page,
          }
        } else {
          this.$toast.info('Платежів не знайдено з цими параметрами')
        }
      } catch (error) {
        console.error('Search test error:', error)
        this.$toast.error('Помилка тестування пошуку')
      }
    },
  },
}
</script>

<style scoped>
.financial-module {
  padding: 20px;
  background-color: #f9fafb;
  min-height: calc(100vh - 70px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #2563eb;
}

.filters-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-group select,
.filter-group input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.statistics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.payments-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading,
.error,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.payments-table {
  overflow-x: auto;
}

.payments-table table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th,
.payments-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.payments-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.payments-table td {
  font-size: 14px;
  color: #111827;
}

.user-info,
.course-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name,
.course-title {
  font-weight: 500;
}

.user-email,
.course-price {
  font-size: 12px;
  color: #6b7280;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.payment-method {
  font-weight: 500;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-failed {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-rejected {
  background-color: #fecaca;
  color: #7f1d1d;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn {
  background-color: #10b981;
  color: white;
}

.confirm-btn:hover {
  background-color: #059669;
}

.reject-btn {
  background-color: #ef4444;
  color: white;
}

.reject-btn:hover {
  background-color: #dc2626;
}

.view-btn {
  background-color: #3b82f6;
  color: white;
}

.view-btn:hover {
  background-color: #2563eb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
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

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row label {
  font-weight: 500;
  color: #374151;
  min-width: 120px;
}

.detail-row span {
  color: #111827;
  text-align: right;
}

.confirm-modal .modal-body {
  padding: 20px;
}

.confirm-modal .modal-body p {
  margin-bottom: 16px;
  color: #374151;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-group textarea {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.cancel-btn:hover {
  background-color: #e5e7eb;
}

.confirm-btn {
  background-color: #3b82f6;
  color: white;
}

.confirm-btn:hover {
  background-color: #2563eb;
}

.test-search-btn {
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #10b981;
  color: white;
  margin-left: 8px;
}

.test-search-btn:hover {
  background-color: #059669;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }

  .filter-group {
    min-width: auto;
  }

  .statistics-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .payments-table {
    font-size: 12px;
  }

  .payments-table th,
  .payments-table td {
    padding: 8px;
  }
}
</style>
