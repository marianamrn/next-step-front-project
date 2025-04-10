<!-- src/components/HomePage.vue -->
<template>
    <div class="home-page">
      <header class="header">
        <div class="header-logo">
          <h1 class="logo-text">NextStep</h1>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <button class="logout-button" @click="logout">Вийти</button>
        </div>
      </header>
      
      <div class="content">
        <h1>Ласкаво просимо на NextStep</h1>
        <p>Платформу для дистанційного навчання</p>
        
        <div class="course-section">
          <h2>Доступні курси</h2>
          <p>Тут будуть відображатися ваші курси</p>
          <!-- Тут можна додати список курсів для студента -->
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage',
    data() {
      return {
        userName: 'Користувач'
      }
    },
    mounted() {
      // Отримуємо інформацію про користувача з localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.first_name && user.last_name) {
        this.userName = `${user.first_name} ${user.last_name}`;
      } else if (user.email) {
        this.userName = user.email;
      }
    },
    methods: {
      logout() {
        // Видаляємо дані авторизації
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Перенаправляємо на сторінку входу
        this.$router.push('/login');
      }
    }
  }
  </script>
  
  <style scoped>
  .home-page {
    min-height: 100vh;
    background-color: #f9fafb;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .header-logo {
    display: flex;
    align-items: center;
  }
  
  .logo-text {
    font-size: 24px;
    font-weight: bold;
    color: var(--primary-color);
    margin: 0;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .user-name {
    font-weight: bold;
  }
  
  .logout-button {
    background-color: #f3f4f6;
    color: #333;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .logout-button:hover {
    background-color: #e1e1e1;
  }
  
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    text-align: center;
  }
  
  .content h1 {
    font-size: 32px;
    color: var(--primary-color);
    margin-bottom: 10px;
  }
  
  .content p {
    font-size: 18px;
    color: var(--text-light);
    margin-bottom: 40px;
  }
  
  .course-section {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 30px;
  }
  
  .course-section h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: var(--secondary-color);
  }
  </style>