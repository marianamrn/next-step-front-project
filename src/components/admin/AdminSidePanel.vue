<!-- src/components/admin/AdminSidePanel.vue -->
<template>
    <div class="admin-sidebar">
      <div class="logo-container">
        <h1 class="brand-name">NextStep</h1>
        <p class="panel-name">ADMIN PANEL</p>
      </div>
  
      <!-- Управління -->
      <div class="sidebar-section">
        <h3 class="section-title">Управління</h3>
        <ul class="nav-list">
          <li class="nav-item" @click="navigateTo('administrators')" :class="{ active: activeRoute === 'administrators' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span class="nav-text">Адміністратори</span>
          </li>
          <li class="nav-item" @click="navigateTo('teachers')" :class="{ active: activeRoute === 'teachers' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </span>
            <span class="nav-text">Викладачі</span>
          </li>
          <li class="nav-item" @click="navigateTo('students')" :class="{ active: activeRoute === 'students' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </span>
            <span class="nav-text">Студенти</span>
          </li>
        </ul>
      </div>
  
      <!-- Контент -->
      <div class="sidebar-section">
        <h3 class="section-title">Контент</h3>
        <ul class="nav-list">
          <li class="nav-item" @click="navigateTo('comments')" :class="{ active: activeRoute === 'comments' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </span>
            <span class="nav-text">Коментарі та відгуки</span>
          </li>
          <li class="nav-item" @click="navigateTo('courses')" :class="{ active: activeRoute === 'courses' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </span>
            <span class="nav-text">Курси</span>
          </li>
        </ul>
      </div>
  
      <!-- Дані та параметри -->
      <div class="sidebar-section">
        <h3 class="section-title">Дані та параметри</h3>
        <ul class="nav-list">
          <li class="nav-item" @click="navigateTo('statistics')" :class="{ active: activeRoute === 'statistics' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </span>
            <span class="nav-text">Статистика</span>
          </li>
          <li class="nav-item" @click="navigateTo('financial')" :class="{ active: activeRoute === 'financial' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </span>
            <span class="nav-text">Фінансовий модуль</span>
          </li>
          <li class="nav-item" @click="navigateTo('settings')" :class="{ active: activeRoute === 'settings' }">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </span>
            <span class="nav-text">Налаштування системи</span>
          </li>
        </ul>
      </div>
  
      <!-- Вихід -->
      <div class="logout-container">
        <div class="nav-item logout" @click="logout">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span class="nav-text">Вийти</span>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AdminSidePanel',
    props: {
      activeRoute: {
        type: String,
        default: 'students'
      }
    },
    methods: {
      navigateTo(route) {
        this.$emit('change-route', route);
        
        // Логіка для майбутньої інтеграції з Vue Router
        /* 
        if (route === 'students') {
          this.$router.push('/admin/students');
        } else if (route === 'teachers') {
          this.$router.push('/admin/teachers');
        } else {
          this.$router.push('/admin/' + route);
        } 
        */
      },
      logout() {
        // Тимчасово - емітуємо подію для батьківського компонента
        this.$emit('logout');
        
        /* Логіка для майбутньої інтеграції з API
        async logout() {
          try {
            // Запит на бекенд для виходу з системи
            // await axios.post('/api/logout');
            
            localStorage.removeItem('token');
            this.$router.push('/login');
          } catch (error) {
            console.error('Помилка при виході:', error);
          }
        }
        */
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-sidebar {
    width: 220px;
    height: 100vh;
    background-color: #0B091B;
    color: #fff;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  
  .logo-container {
    padding: 0 20px;
    margin-bottom: 30px;
  }
  
  .brand-name {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
  }
  
  .panel-name {
    font-size: 12px;
    opacity: 0.8;
    margin: 0;
  }
  
  .sidebar-section {
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 12px;
    color: #a0a0a0;
    padding: 0 20px;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  
  .nav-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 10px 20px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .nav-item:hover {
    background-color: #211F35;
  }
  
  .nav-item.active {
    background-color: #443BC9;
  }
  
  .icon {
    display: flex;
    margin-right: 10px;
  }
  
  .nav-text {
    font-size: 14px;
  }
  
  .logout-container {
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 10px;
  }
  
  .logout {
    color: #ff5a5a;
  }
  </style>