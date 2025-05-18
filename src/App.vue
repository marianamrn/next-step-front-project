<!-- src/App.vue -->
<template>
  <div id="app">
    <div class="app-wrapper">
      <!-- Хедер (показується на всіх сторінках крім адмін-панелі та авторизації) -->
      <app-header v-if="showLayout" />

      <!-- Основний контент -->
      <main class="main-content" :class="{ 'with-layout': showLayout }">
        <router-view />
      </main>

      <!-- Футер (показується на всіх сторінках крім адмін-панелі та авторизації) -->
      <app-footer v-if="showLayout" />
    </div>
  </div>
</template>

<script>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFooter,
  },
  computed: {
    showLayout() {
      // Не показуємо хедер і футер на сторінках авторизації та адмін-панелі
      const hiddenRoutes = ['/login', '/register', '/admin']
      const currentPath = this.$route.path

      // Перевіряємо чи поточний шлях починається з будь-якого з прихованих маршрутів
      return !hiddenRoutes.some((route) => currentPath.startsWith(route))
    },
  },
}
</script>

<style>
/* Імпорт шрифтів та основних стилів */
@import './assets/main.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.main-content.with-layout {
  /* Додаткові стилі для контенту з хедером та футером */
  min-height: calc(100vh - 140px); /* 70px хедер + 70px футер */
}

/* Глобальні стилі для Vuetify компонентів */
.v-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
  font-family: 'VinnytsiaSansBold', 'Inter', sans-serif !important;
}

.v-text-field .v-field__input,
.v-textarea .v-field__input {
  font-family: 'VinnytsiaSansReg', 'Inter', sans-serif !important;
}

.v-card-title {
  font-family: 'VinnytsiaSansBold', 'Inter', sans-serif !important;
}

/* Налаштування для первинного кольору Vuetify */
.v-theme--light .v-btn--variant-contained.bg-primary {
  background-color: var(--primary-color) !important;
  color: var(--white) !important;
}

.v-theme--light .v-btn--variant-contained.bg-primary:hover {
  background-color: var(--accent-color) !important;
}

/* Стилі для перехідних ефектів між сторінками */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
