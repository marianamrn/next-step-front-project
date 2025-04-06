<!-- src/components/admin/AdminPanel.vue -->
<template>
    <div class="admin-panel">
      <!-- Бокова панель навігації -->
      <admin-side-panel :activeRoute="currentRoute" @change-route="changeRoute" @logout="logout" />
      
      <div class="main-content">
        <!-- Верхня панель з інформацією про користувача -->
        <admin-header :pageTitle="pageTitle" />
        
        <!-- Основний контент через router-view -->
        <div class="content-area">
          <router-view />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AdminSidePanel from './AdminSidePanel.vue';
  import AdminHeader from './AdminHeader.vue';
  
  export default {
    name: 'AdminPanel',
    components: {
      AdminSidePanel,
      AdminHeader
    },
    computed: {
      // Визначаємо поточний маршрут на основі URL
      currentRoute() {
        const path = this.$route.path;
        const route = path.split('/').pop();
        return route || 'students';
      },
      
      // Визначаємо заголовок сторінки на основі поточного маршруту
      pageTitle() {
        switch(this.currentRoute) {
          case 'administrators':
            return 'Адміністратори';
          case 'teachers':
            return 'Викладачі';
          case 'students':
            return 'Студенти';
          case 'comments':
            return 'Коментарі та відгуки';
          case 'courses':
            return 'Курси';
          case 'statistics':
            return 'Статистика';
          case 'financial':
            return 'Фінансовий модуль';
          case 'settings':
            return 'Налаштування системи';
          default:
            return 'Адмін-панель';
        }
      }
    },
    methods: {
      // Переходимо на новий маршрут через Vue Router
      changeRoute(route) {
        this.$router.push(`/admin/${route}`);
      },
      
      // Виходимо з системи
      logout() {
        // Тимчасово - перенаправлення на сторінку логіну
        alert('Вихід з системи');
        this.$router.push('/login');
        
        /* Логіка для майбутньої інтеграції з API
        try {
          // Запит до API для виходу з системи
          // await axios.post('/api/logout');
          
          localStorage.removeItem('token');
          this.$router.push('/login');
        } catch (error) {
          console.error('Помилка при виході:', error);
        }
        */
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-panel {
    display: flex;
    min-height: 100vh;
    background-color: #f9fafb;
  }
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .content-area {
    flex: 1;
    overflow: auto;
  }
  </style>