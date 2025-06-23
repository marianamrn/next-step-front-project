<template>
  <div class="all-comments-tab">
    <!-- Заголовок та дії -->
    <div class="tab-header">
      <div class="header-info">
        <h2 class="tab-title">Всі коментарі</h2>
        <p class="tab-subtitle">Перегляньте та управляйте всіма коментарями</p>
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

    <!-- Список коментарів -->
    <div class="comments-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Завантаження коментарів...</p>
      </div>

      <div v-else-if="comments.length === 0" class="empty-state">
        <v-icon class="empty-icon">mdi-comment-multiple-outline</v-icon>
        <h3>Немає коментарів</h3>
        <p>Поки що немає жодного коментаря</p>
      </div>

      <div v-else class="comments-container">
        <div 
          v-for="comment in comments" 
          :key="comment.id" 
          class="comment-card"
        >
          <!-- Інформація про користувача -->
          <div class="comment-header">
            <div class="user-info">
              <div class="user-avatar">
                <v-icon>mdi-account-circle</v-icon>
              </div>
              <div class="user-details">
                <div class="user-name">{{ comment.user?.name || 'Користувач' }}</div>
                <div class="user-email">{{ comment.user?.email || 'email@example.com' }}</div>
                <div class="comment-date">{{ formatDate(comment.created_at) }}</div>
              </div>
            </div>
            <div class="comment-status">
              <span :class="['status-badge', getStatusClass(comment.status)]">
                {{ getStatusText(comment.status) }}
              </span>
            </div>
          </div>

          <!-- Інформація про відгук -->
          <div class="review-info">
            <div class="review-preview">
              <v-icon class="review-icon">mdi-star</v-icon>
              <span class="review-text">{{ getReviewPreview(comment.review) }}</span>
            </div>
            <div class="course-info">
              <v-icon class="course-icon">mdi-book-open-variant</v-icon>
              {{ comment.review?.course?.title || 'Курс' }}
            </div>
          </div>

          <!-- Текст коментаря -->
          <div class="comment-content">
            <p class="comment-text">{{ comment.content }}</p>
          </div>

          <!-- Ієрархія коментарів -->
          <div v-if="comment.parent" class="comment-hierarchy">
            <div class="reply-indicator">
              <v-icon>mdi-reply</v-icon>
              <span>Відповідь на коментар:</span>
            </div>
            <div class="parent-comment">
              <div class="parent-user">{{ comment.parent.user?.name || 'Користувач' }}</div>
              <div class="parent-text">{{ comment.parent.content }}</div>
            </div>
          </div>

          <!-- Дії -->
          <div class="comment-actions">
            <button 
              @click="deleteComment(comment.id)"
              class="action-button delete"
              :disabled="comment.processing"
            >
              <v-icon>mdi-delete</v-icon>
              Видалити
            </button>
            <button 
              @click="viewCommentDetails(comment)"
              class="action-button view"
            >
              <v-icon>mdi-eye</v-icon>
              Деталі
            </button>
          </div>

          <!-- Індикатор обробки -->
          <div v-if="comment.processing" class="processing-indicator">
            <div class="processing-spinner"></div>
            <span>Обробка...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальне вікно з деталями коментаря -->
    <div v-if="selectedComment" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Деталі коментаря</h3>
          <button @click="closeModal" class="close-button">
            <v-icon>mdi-close</v-icon>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Користувач</h4>
            <p><strong>Ім'я:</strong> {{ selectedComment.user?.name || 'Невідомо' }}</p>
            <p><strong>Email:</strong> {{ selectedComment.user?.email || 'Невідомо' }}</p>
            <p><strong>Дата:</strong> {{ formatDate(selectedComment.created_at) }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Курс</h4>
            <p><strong>Назва:</strong> {{ selectedComment.review?.course?.title || 'Невідомо' }}</p>
            <p><strong>Категорія:</strong> {{ selectedComment.review?.course?.category?.name || 'Невідомо' }}</p>
          </div>
          
          <div class="detail-section">
            <h4>Відгук</h4>
            <div class="review-details">
              <div class="review-rating">
                <div class="stars">
                  <v-icon 
                    v-for="star in 5" 
                    :key="star"
                    :class="['star', { filled: star <= selectedComment.review?.rating }]"
                  >
                    {{ star <= selectedComment.review?.rating ? 'mdi-star' : 'mdi-star-outline' }}
                  </v-icon>
                </div>
                <span class="rating-value">{{ selectedComment.review?.rating }}/5</span>
              </div>
              <div class="review-content-full">
                {{ selectedComment.review?.content }}
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Коментар</h4>
            <div class="comment-text-full">
              {{ selectedComment.content }}
            </div>
          </div>
          
          <div v-if="selectedComment.parent" class="detail-section">
            <h4>Відповідь на коментар</h4>
            <div class="parent-comment-details">
              <p><strong>Автор:</strong> {{ selectedComment.parent.user?.name || 'Невідомо' }}</p>
              <p><strong>Дата:</strong> {{ formatDate(selectedComment.parent.created_at) }}</p>
              <div class="parent-comment-text">
                {{ selectedComment.parent.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="deleteComment(selectedComment.id)" class="action-button delete">
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
  name: 'AllCommentsTab',
  props: {
    comments: {
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
      selectedComment: null
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

    getReviewPreview(review) {
      if (!review || !review.content) return 'Відгук не знайдено'
      return review.content.length > 100 
        ? review.content.substring(0, 100) + '...' 
        : review.content
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

    deleteComment(commentId) {
      // Додаємо індикатор обробки
      const comment = this.comments.find(c => c.id === commentId)
      if (comment) {
        this.$set(comment, 'processing', true)
      }
      
      this.$emit('delete', commentId)
    },

    viewCommentDetails(comment) {
      this.selectedComment = comment
    },

    closeModal() {
      this.selectedComment = null
    },

    setComments(comments) {
      this.comments = comments
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
.all-comments-tab {
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

.comments-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: all 0.2s ease;
}

.comment-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.comment-header {
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

.comment-date {
  font-size: 12px;
  color: #9ca3af;
}

.comment-status {
  display: flex;
  align-items: center;
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

.review-info {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.review-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.review-icon {
  color: #fbbf24;
  font-size: 16px;
}

.review-text {
  font-style: italic;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.course-icon {
  font-size: 14px;
}

.comment-content {
  margin-bottom: 16px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 0;
}

.comment-hierarchy {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 6px;
}

.reply-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
  margin-bottom: 8px;
}

.parent-comment {
  background-color: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e0e7ff;
}

.parent-user {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.parent-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.comment-actions {
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
  max-width: 700px;
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

.review-details {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
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

.rating-value {
  font-weight: 600;
  color: #374151;
}

.review-content-full {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.comment-text-full {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.parent-comment-details {
  background-color: #f0f9ff;
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.parent-comment-text {
  background-color: white;
  padding: 12px;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
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
  .all-comments-tab {
    padding: 16px;
  }
  
  .tab-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .comment-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .comment-status {
    align-self: flex-start;
  }
  
  .comment-actions {
    justify-content: flex-start;
  }
  
  .modal-content {
    margin: 20px;
  }
}
</style> 