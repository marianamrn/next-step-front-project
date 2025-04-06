<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Тимчасово показуємо адмін-панель для перегляду дизайну -->
    <admin-panel v-if="showAdminPanel" />
    <!-- Використовуємо маршрутизатор для реальної навігації -->
    <router-view v-else />
  </div>
</template>

<script>
import AdminPanel from '@/components/admin/AdminPanel.vue';

export default {
  name: 'App',
  components: {
    AdminPanel
  },
  data() {
    return {
      showAdminPanel: true // Тимчасово true для перегляду дизайну
    }
  },
  mounted() {
    // При інтеграції з маршрутизатором змінити на false
    // та налаштувати маршрути до всіх компонентів адмін-панелі
    
    /* Тимчасовий код для переходу між логіном і адмін-панеллю
    if (this.$route.path === '/') {
      this.$router.push('/admin/students');
    }
    */
    
    /* Логіка для майбутньої інтеграції з API та Vue Router
    const token = localStorage.getItem('token');
    if (!token && this.$route.path !== '/login' && this.$route.path !== '/register') {
      this.$router.push('/login');
    }
    */
  }
}
</script>

<style>
/* Глобальні стилі */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'VinnytsiaSansBold', sans-serif;
  color: #333;
  line-height: 1.6;
}

:root {
  /* Основні кольори */
  --primary-color: #443BC9;
  --secondary-color: #0B091B;
  --success-color: #4caf50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --info-color: #2196f3;
  --background-color: #f9fafb;
  --border-color: #e1e1e1;
  --text-color: #333;
  --text-light: #666;
}

@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansBold&display=swap');
</style>