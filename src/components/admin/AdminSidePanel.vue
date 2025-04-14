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
        <li
          class="nav-item"
          @click="navigateTo('administrators')"
          :class="{ active: activeRoute === 'administrators' }"
        >
          <span class="icon">
            <v-icon>mdi-account</v-icon>
          </span>
          <span class="nav-text">Адміністратори</span>
        </li>
        <li
          class="nav-item"
          @click="navigateTo('teachers')"
          :class="{ active: activeRoute === 'teachers' }"
        >
          <span class="icon">
            <v-icon>mdi-human-male-board</v-icon>
          </span>
          <span class="nav-text">Викладачі</span>
        </li>
        <li
          class="nav-item"
          @click="navigateTo('students')"
          :class="{ active: activeRoute === 'students' }"
        >
          <span class="icon">
            <v-icon>mdi-account-school-outline</v-icon>
          </span>
          <span class="nav-text">Студенти</span>
        </li>
      </ul>
    </div>

    <!-- Контент -->
    <div class="sidebar-section">
      <h3 class="section-title">Контент</h3>
      <ul class="nav-list">
        <li
          class="nav-item"
          @click="navigateTo('comments')"
          :class="{ active: activeRoute === 'comments' }"
        >
          <span class="icon">
            <v-icon>mdi-comment-text</v-icon>
          </span>
          <span class="nav-text">Коментарі та відгуки</span>
        </li>
        <li
          class="nav-item"
          @click="navigateTo('courses')"
          :class="{ active: activeRoute === 'courses' }"
        >
          <span class="icon">
            <v-icon>mdi-book-open-variant</v-icon>
          </span>
          <span class="nav-text">Курси</span>
        </li>
      </ul>
    </div>

    <!-- Дані та параметри -->
    <div class="sidebar-section">
      <h3 class="section-title">Дані та параметри</h3>
      <ul class="nav-list">
        <li
          class="nav-item"
          @click="navigateTo('statistics')"
          :class="{ active: activeRoute === 'statistics' }"
        >
          <span class="icon">
            <v-icon>mdi-chart-bar</v-icon>
          </span>
          <span class="nav-text">Статистика</span>
        </li>
        <li
          class="nav-item"
          @click="navigateTo('financial')"
          :class="{ active: activeRoute === 'financial' }"
        >
          <span class="icon">
            <v-icon>mdi-currency-usd</v-icon>
          </span>
          <span class="nav-text">Фінансовий модуль</span>
        </li>
        <li
          class="nav-item"
          @click="navigateTo('settings')"
          :class="{ active: activeRoute === 'settings' }"
        >
          <span class="icon">
            <v-icon>mdi-cog</v-icon>
          </span>
          <span class="nav-text">Налаштування системи</span>
        </li>
      </ul>
    </div>

    <!-- Вихід -->
    <div class="logout-container">
      <div class="nav-item logout" @click="logout">
        <span class="icon">
          <v-icon>mdi-logout-variant</v-icon>
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
      default: 'students',
    },
  },
  methods: {
    navigateTo(route) {
      // Використовуємо Vue Router для навігації
      this.$router.push(`/admin/${route}`)
    },
    logout() {
      this.$emit('logout')
    },
  },
}
</script>

<style scoped>
.admin-sidebar {
  width: 220px;
  min-height: 100vh; /* Забезпечує мінімальну висоту */
  background-color: #0b091b;
  color: #fff;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: sticky; /* Змінено з fixed на sticky для кращої інтеграції з іншим контентом */
  top: 0; /* Починаючи з верхньої частини */
  left: 0;
  flex-shrink: 0; /* Щоб ширина не змінювалась при стиску вікна */
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
  background-color: #211f35;
}

.nav-item.active {
  background-color: #443bc9;
}

.icon {
  display: flex;
  margin-right: 10px;
}

.nav-text {
  font-size: 14px;
}

.logout-container {
  margin-top: auto; /* Підсуває логаут до низу */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
  padding-bottom: 10px; /* Забезпечує трохи більше простору внизу кнопки, щоб вона не була впритул до краю */
}

.logout {
  color: #ff5a5a;
}

/* Враховуємо контейнер, якщо бокова панель є частиною flex-структури */
@media screen and (min-width: 768px) {
  .admin-sidebar {
    height: 100vh; /* Фіксована висота для десктопів */
  }
}
</style>
