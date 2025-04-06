<!-- src/components/admin/AdminPanel.vue -->
<template>
    <div class="admin-panel">
      <!-- Бокова панель навігації -->
      <admin-side-panel :activeRoute="activeRoute" @change-route="changeRoute" @logout="logout" />
      
      <div class="main-content">
        <!-- Верхня панель з інформацією про користувача -->
        <admin-header :pageTitle="pageTitle" />
        
        <!-- Основний контент - залежить від активного маршруту -->
        <div class="content-area">
          <student-management v-if="activeRoute === 'students'" />
          <course-management v-else-if="activeRoute === 'courses'" />
          <div v-else class="coming-soon">
            <h2>Розділ в розробці</h2>
            <p>Функціональність "{{ pageTitle }}" буде доступна незабаром.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import AdminSidePanel from './AdminSidePanel.vue';
  import AdminHeader from './AdminHeader.vue';
  import StudentManagement from './StudentManagement.vue';
  import CourseManagement from './CourseManagement.vue';
  
  export default {
    name: 'AdminPanel',
    components: {
      AdminSidePanel,
      AdminHeader,
      StudentManagement,
      CourseManagement
    },
    data() {
      return {
        activeRoute: 'courses' // За замовчуванням показуємо управління курсами
      }
    },
    computed: {
      pageTitle() {
        switch(this.activeRoute) {
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
      changeRoute(route) {
        this.activeRoute = route;
        
        /* Логіка для майбутньої інтеграції з Vue Router
        this.$router.push(`/admin/${route}`);
        */
      },
      logout() {
        // Тимчасово - перенаправлення на сторінку логіну
        alert('Вихід з системи');
        
        /* Логіка для майбутньої інтеграції з API та Vue Router
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
  
  .coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100vh - 70px);
    text-align: center;
    color: #666;
  }
  
  .coming-soon h2 {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .coming-soon p {
    font-size: 16px;
  }
  </style>