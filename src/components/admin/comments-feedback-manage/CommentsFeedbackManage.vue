<template>
  <div class="comments-feedback-manage">
    <!-- Заголовок та статистика -->
    <div class="header-section">
      <div class="title-section">
        <h1 class="page-title">Коментарі та відгуки</h1>
        <p class="page-description">Управління відгуками та коментарями користувачів</p>
      </div>

      <!-- Статистика -->
      <div class="stats-section" v-if="stats">
        <div class="stat-card">
          <div class="stat-number">{{ stats.pendingReviews || 0 }}</div>
          <div class="stat-label">Відгуки на модерації</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.pendingComments || 0 }}</div>
          <div class="stat-label">Коментарі на модерації</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalReviews || 0 }}</div>
          <div class="stat-label">Всього відгуків</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalComments || 0 }}</div>
          <div class="stat-label">Всього коментарів</div>
        </div>
      </div>
    </div>

    <!-- Повідомлення про нереалізовані функції -->
    <div v-if="showNotImplementedMessage" class="not-implemented-message">
      <div class="alert alert-info">
        <h4>Функції модерації ще не реалізовані</h4>
        <p>
          Деякі функції управління коментарями та відгуками ще знаходяться в розробці. Поки що ви
          можете переглядати існуючі дані, але функції модерації будуть доступні пізніше.
        </p>
      </div>
    </div>

    <!-- Повідомлення про помилку -->
    <div v-if="error" class="error-message">
      <div class="alert alert-danger">
        {{ error }}
      </div>
    </div>

    <!-- Таби навігації -->
    <div class="tabs-section">
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          <span class="tab-icon">
            <v-icon>{{ tab.icon }}</v-icon>
          </span>
          <span class="tab-text">{{ tab.name }}</span>
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Контент табів -->
    <div class="content-section">
      <!-- Відгуки на модерації -->
      <div v-if="activeTab === 'pending-reviews'" class="tab-content">
        <pending-reviews-tab
          :reviews="pendingReviews"
          :loading="loading"
          @approve="approveReview"
          @reject="rejectReview"
          @refresh="loadPendingReviews"
        />
      </div>

      <!-- Коментарі на модерації -->
      <div v-if="activeTab === 'pending-comments'" class="tab-content">
        <pending-comments-tab
          :comments="pendingComments"
          :loading="loading"
          @approve="approveComment"
          @reject="rejectComment"
          @refresh="loadPendingComments"
        />
      </div>

      <!-- Всі відгуки -->
      <div v-if="activeTab === 'all-reviews'" class="tab-content">
        <all-reviews-tab
          :reviews="allReviews"
          :loading="loading"
          @delete="deleteReview"
          @refresh="loadAllReviews"
        />
      </div>

      <!-- Всі коментарі -->
      <div v-if="activeTab === 'all-comments'" class="tab-content">
        <all-comments-tab
          :comments="allComments"
          :loading="loading"
          @delete="deleteComment"
          @refresh="loadAllComments"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { reviewsApi, moderationApi } from '@/services/api.js'
import PendingReviewsTab from './PendingReviewsTab.vue'
import PendingCommentsTab from './PendingCommentsTab.vue'
import AllReviewsTab from './AllReviewsTab.vue'
import AllCommentsTab from './AllCommentsTab.vue'

export default {
  name: 'CommentsFeedbackManage',
  components: {
    PendingReviewsTab,
    PendingCommentsTab,
    AllReviewsTab,
    AllCommentsTab,
  },
  data() {
    return {
      activeTab: 'pending-reviews',
      stats: {
        pendingReviews: 0,
        pendingComments: 0,
        totalReviews: 0,
        totalComments: 0,
      },
      loading: false,
      error: null,
      showNotImplementedMessage: false,
      pendingReviews: [],
      pendingComments: [],
      allReviews: [],
      allComments: [],
      tabs: [
        {
          id: 'pending-reviews',
          name: 'Відгуки на модерації',
          icon: 'mdi-clock-outline',
          count: 0,
        },
        {
          id: 'pending-comments',
          name: 'Коментарі на модерації',
          icon: 'mdi-comment-text-outline',
          count: 0,
        },
        {
          id: 'all-reviews',
          name: 'Всі відгуки',
          icon: 'mdi-star-outline',
        },
        {
          id: 'all-comments',
          name: 'Всі коментарі',
          icon: 'mdi-comment-multiple-outline',
        },
      ],
    }
  },
  async mounted() {
    await this.loadStats()
    await this.loadPendingReviews()
    await this.loadPendingComments()
  },
  watch: {
    // Завантажуємо дані при зміні табів
    activeTab(newTab) {
      if (newTab === 'all-reviews' && this.allReviews.length === 0) {
        this.loadAllReviews()
      }
      if (newTab === 'all-comments' && this.allComments.length === 0) {
        this.loadAllComments()
      }
    },
  },
  methods: {
    // Завантаження статистики
    async loadStats() {
      try {
        this.loading = true
        this.error = null
        const response = await moderationApi.getModerationStats()
        this.stats = response.data

        // Оновлюємо лічильники в табах
        this.tabs[0].count = this.stats.pendingReviews || this.stats.reviews?.pending || 0
        this.tabs[1].count = this.stats.pendingComments || this.stats.comments?.pending || 0
      } catch (error) {
        console.error('Помилка завантаження статистики:', error)
        this.error = 'Не вдалося завантажити статистику'
        // Якщо всі endpoints повертають 404, показуємо повідомлення
        if (error.response?.status === 404) {
          this.showNotImplementedMessage = true
        }
      } finally {
        this.loading = false
      }
    },

    // Завантаження відгуків на модерації
    async loadPendingReviews() {
      try {
        const response = await moderationApi.getPendingReviews()
        this.$refs.pendingReviewsTab.setReviews(response.data.reviews.data)
      } catch (error) {
        console.error('Помилка завантаження відгуків на модерації:', error)
        this.$refs.pendingReviewsTab.setError('Не вдалося завантажити відгуки на модерації')
      }
    },

    // Завантаження коментарів на модерації
    async loadPendingComments() {
      try {
        const response = await moderationApi.getPendingComments()
        this.$refs.pendingCommentsTab.setComments(response.data.comments.data)
      } catch (error) {
        console.error('Помилка завантаження коментарів на модерації:', error)
        this.$refs.pendingCommentsTab.setError('Не вдалося завантажити коментарі на модерації')
      }
    },

    // Завантаження всіх відгуків
    async loadAllReviews() {
      try {
        const response = await reviewsApi.getAllReviews()
        this.$refs.allReviewsTab.setReviews(response.data.reviews.data)
      } catch (error) {
        console.error('Помилка завантаження всіх відгуків:', error)
        this.$refs.allReviewsTab.setError('Не вдалося завантажити всі відгуки')
      }
    },

    // Завантаження всіх коментарів
    async loadAllComments() {
      try {
        const response = await reviewsApi.getAllComments()
        this.$refs.allCommentsTab.setComments(response.data.comments.data)
      } catch (error) {
        console.error('Помилка завантаження всіх коментарів:', error)
        this.$refs.allCommentsTab.setError('Не вдалося завантажити всі коментарі')
      }
    },

    // Схвалення відгуку
    async approveReview(reviewId) {
      try {
        await moderationApi.approveReview(reviewId)
        this.$toast?.success('Відгук схвалено')
        await this.loadPendingReviews()
        await this.loadStats()
      } catch (error) {
        console.error('Помилка схвалення відгуку:', error)
        this.$toast?.error('Помилка схвалення відгуку')
      }
    },

    // Відхилення відгуку
    async rejectReview(reviewId) {
      try {
        await moderationApi.rejectReview(reviewId)
        this.$toast?.success('Відгук відхилено')
        await this.loadPendingReviews()
        await this.loadStats()
      } catch (error) {
        console.error('Помилка відхилення відгуку:', error)
        this.$toast?.error('Помилка відхилення відгуку')
      }
    },

    // Схвалення коментаря
    async approveComment(commentId) {
      try {
        await moderationApi.approveComment(commentId)
        this.$toast?.success('Коментар схвалено')
        await this.loadPendingComments()
        await this.loadStats()
      } catch (error) {
        console.error('Помилка схвалення коментаря:', error)
        this.$toast?.error('Помилка схвалення коментаря')
      }
    },

    // Відхилення коментаря
    async rejectComment(commentId) {
      try {
        await moderationApi.rejectComment(commentId)
        this.$toast?.success('Коментар відхилено')
        await this.loadPendingComments()
        await this.loadStats()
      } catch (error) {
        console.error('Помилка відхилення коментаря:', error)
        this.$toast?.error('Помилка відхилення коментаря')
      }
    },

    // Видалення відгуку
    async deleteReview(reviewId) {
      try {
        await reviewsApi.deleteReview(reviewId)
        this.$toast?.success('Відгук видалено')
        await this.loadAllReviews()
      } catch (error) {
        console.error('Помилка видалення відгуку:', error)
        this.$toast?.error('Помилка видалення відгуку')
      }
    },

    // Видалення коментаря
    async deleteComment(commentId) {
      try {
        await reviewsApi.deleteComment(commentId)
        this.$toast?.success('Коментар видалено')
        await this.loadAllComments()
      } catch (error) {
        console.error('Помилка видалення коментаря:', error)
        this.$toast?.error('Помилка видалення коментаря')
      }
    },
  },
}
</script>

<style scoped>
.comments-feedback-manage {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.not-implemented-message {
  margin-bottom: 20px;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-info {
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.alert p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 20px;
  overflow-x: auto;
}

.tab-button {
  background: none;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #007bff;
  background-color: #f8f9fa;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: 600;
}

.tab-content {
  min-height: 400px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .comments-feedback-manage {
    padding: 15px;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    text-align: left;
    border-bottom: 1px solid #e9ecef;
  }
}
</style>
