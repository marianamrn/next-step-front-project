<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Використовуємо тільки router-view, тепер AdminPanel вже містить все необхідне -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
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