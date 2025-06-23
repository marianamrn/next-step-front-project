<template>
  <div class="all-reviews-tab">
    <!-- Заголовок та дії -->
    <div class="tab-header">
      <div class="header-info">
        <h2 class="tab-title">Всі відгуки</h2>
        <p class="tab-subtitle">Перегляньте та управляйте всіма відгуками</p>
      </div>
      <div class="header-actions">
        <button 
          @click="$emit('refresh')" 
          class="refresh-button"
          :disabled="loading"
        >
          <v-icon>mdi-refresh</v-icon>
          Оновити
        </button>
      </div>
    </div>

    <!-- Список відгуків -->
    <div class="reviews-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Завантаження відгуків...</p>
      </div>

      <div v-else-if="reviews.length === 0" class="empty-state">
        <v-icon class="empty-icon">mdi-star-outline</v-icon>
        <h3>Немає відгуків</h3>
        <p>Поки що немає жодного відгуку</p>
      </div>

      <div v-else class="reviews-container">
        <div 
          v-for="review in reviews" 
          :key="review.id" 
          class="review-card"
        >
          <!-- Інформація про користувача -->
          <div class="review-header">
            <div class="user-info">
              <div class="user-avatar">
                <v-icon>mdi-account-circle</v-icon>
              </div>
              <div class="user-details">
                <div class="user-name">{{ review.user?.name || 'Користувач' }}</div>
                <div class="user-email">{{ review.user?.email || 'email@example.com' }}</div>
                <div class="review-date">{{ formatDate(review.created_at) }}</div>
              </div>
            </div>
            <div class="review-rating">
              <div class="stars">
                <v-icon 
                  v-for="star in 5" 
                  :key="star"
                  :class="['star', { filled: star <= review.rating }]"
                >
                  {{ star <= review.rating ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
              </div>
              <div class="rating-text">{{ review.rating }}/5</div>
            </div>
          </div>

          <!-- Інформація про курс -->
          <div class="course-info">
            <div class="course-title">
              <v-icon class="course-icon">mdi-book-open-variant</v-icon>
              {{ review.course?.title || 'Курс' }}
            </div>
          </div>

          <!-- Текст відгуку -->
          <div class="review-content">
            <p class="review-text">{{ review.content }}</p>
          </div>

          <!-- Статус відгуку -->
          <div class="review-status">
            <span :class="['status-badge', getStatusClass(review.status)]">
              {{ getStatusText(review.status) }}
            </span>
          </div>

          <!-- Дії -->
          <div class="review-actions">
            <button 
              @click="deleteReview(review.id)"
              class="action-button delete"
              :disabled="review.processing"
            >
              <v-icon>mdi-delete</v-icon>
              Видалити
            </button>
            <button 
              @click="viewReviewDetails(review)"
              class="action-button view"
            >
              <v-icon>mdi-eye</v-icon>
              Деталі
            </button>
          </div>

          <!-- Індикатор обробки -->
          <div v-if="review.processing" class="processing-indicator">
            <div class="processing-spinner"></div>
            <span>Обробка...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальне вікно з деталями відгуку -->
    <div v-if="selectedReview" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Деталі відгуку</h3>
          <button @click="closeModal" class="close-button">
            <v-icon>mdi-close</v-icon>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Користувач</h4>
            <p><strong>Ім'я:</strong> {{ selectedReview.user?.name || 'Невідомо' }}</p>
            <p><strong>Email:</strong> {{ selectedReview.user?.email || 'Невідомо' }}</p>
            <p><strong>Дата:</strong> {{ formatDate(selectedReview.created_at) }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Курс</h4>
            <p><strong>Назва:</strong> {{ selectedReview.course?.title || 'Невідомо' }}</p>
            <p><strong>Категорія:</strong> {{ selectedReview.course?.category?.name || 'Невідомо' }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Оцінка</h4>
            <div class="rating-display">
              <div class="stars">
                <v-icon 
                  v-for="star in 5" 
                  :key="star"
                  :class="['star', { filled: star <= selectedReview.rating }]"
                >
                  {{ star <= selectedReview.rating ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
              </div>
              <span class="rating-value">{{ selectedReview.rating }}/5</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Текст відгуку</h4>
            <div class="review-text-full">
              {{ selectedReview.content }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="deleteReview(selectedReview.id)" class="action-button delete">
            <v-icon>mdi-delete</v-icon>
            Видалити
          </button>
          <button @click="closeModal" class="action-button cancel">
            Скасувати
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AllReviewsTab',
  props: {
    reviews: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedReview: null
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Невідомо'
      const date = new Date(dateString)
      return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      switch (status) {
        case 'approved':
          return 'approved'
        case 'pending':
          return 'pending'
        case 'rejected':
          return 'rejected'
        default:
          return 'unknown'
      }
    },

    getStatusText(status) {
      switch (status) {
        case 'approved':
          return 'Схвалено'
        case 'pending':
          return 'На модерації'
        case 'rejected':
          return 'Відхилено'
        default:
          return 'Невідомо'
      }
    },

    deleteReview(reviewId) {
      // Додаємо індикатор обробки
      const review = this.reviews.find(r => r.id === reviewId)
      if (review) {
        this.$set(review, 'processing', true)
      }
      
      this.$emit('delete', reviewId)
    },

    viewReviewDetails(review) {
      this.selectedReview = review
    },

    closeModal() {
      this.selectedReview = null
    },

    setReviews(reviews) {
      this.reviews = reviews
      this.loading = false
    },

    setError(errorMessage) {
      this.error = errorMessage
      this.loading = false
    },

    async refresh() {
      this.loading = true
      this.error = null
      this.$emit('refresh')
    }
  }
}
</script>

<style scoped>
.all-reviews-tab {
  padding: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-info {
  flex: 1;
}

.tab-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.tab-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  color: #6b7280;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: all 0.2s ease;
}

.review-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
}

.review-date {
  font-size: 12px;
  color: #9ca3af;
}

.review-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
  color: #d1d5db;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.course-info {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.course-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.course-icon {
  color: #6b7280;
}

.review-content {
  margin-bottom: 16px;
}

.review-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

.review-status {
  margin-bottom: 16px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.rejected {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-badge.unknown {
  background-color: #f3f4f6;
  color: #6b7280;
}

.review-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.action-button.delete {
  background-color: #ef4444;
  color: white;
}

.action-button.delete:hover:not(:disabled) {
  background-color: #dc2626;
}

.action-button.view {
  background-color: #3b82f6;
  color: white;
}

.action-button.view:hover:not(:disabled) {
  background-color: #2563eb;
}

.action-button.cancel {
  background-color: #6b7280;
  color: white;
}

.action-button.cancel:hover:not(:disabled) {
  background-color: #4b5563;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.processing-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  font-size: 14px;
  color: #6b7280;
}

.processing-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Модальне вікно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.detail-section p {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-value {
  font-weight: 600;
  color: #374151;
}

.review-text-full {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .all-reviews-tab {
    padding: 16px;
  }
  
  .tab-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .review-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .review-rating {
    align-items: flex-start;
  }
  
  .review-actions {
    justify-content: flex-start;
  }
  
  .modal-content {
    margin: 20px;
  }
}
</style> 