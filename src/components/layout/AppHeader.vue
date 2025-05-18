<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <!-- Логотип -->
        <div class="logo-section">
          <router-link to="/" class="logo-link">
            <img src="@/assets/img/logo.png" alt="NextStep Logo" class="logo-image" />
            <span class="logo-text">NextStep</span>
          </router-link>
        </div>

        <!-- Навігаційне меню -->
        <nav class="navigation">
          <ul class="nav-list">
            <li class="nav-item">
              <router-link to="/" class="nav-link" active-class="nav-link--active">
                Головна
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/courses" class="nav-link" active-class="nav-link--active">
                Курси
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link" active-class="nav-link--active">
                Про нас
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/my-courses" class="nav-link" active-class="nav-link--active">
                Мої курси
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Дії користувача -->
        <div class="user-actions">
          <!-- Корзина -->
          <v-btn icon variant="text" class="cart-btn" @click="openCart">
            <v-icon>mdi-cart-outline</v-icon>
            <v-badge
              v-if="cartItemsCount > 0"
              :content="cartItemsCount"
              color="error"
              offset-x="12"
              offset-y="12"
            />
          </v-btn>

          <!-- Профіль користувача (якщо авторизований) -->
          <v-btn
            v-if="isAuthenticated"
            icon
            variant="text"
            class="profile-btn"
            @click="openProfile"
          >
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-btn>

          <!-- Кнопка входу (якщо не авторизований) -->
          <v-btn
            v-if="!isAuthenticated"
            variant="contained"
            color="primary"
            class="login-btn"
            @click="goToLogin"
          >
            Увійти
          </v-btn>

          <!-- Меню користувача (якщо авторизований) -->
          <v-menu v-if="isAuthenticated">
            <template v-slot:activator="{ props }">
              <v-btn icon variant="text" v-bind="props">
                <v-icon>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="goToProfile">
                <v-list-item-title>Профіль</v-list-item-title>
              </v-list-item>
              <v-list-item @click="goToMyCourses">
                <v-list-item-title>Мої курси</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="logout">
                <v-list-item-title>Вийти</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Мобільне меню -->
        <div class="mobile-menu">
          <v-btn icon variant="text" @click="toggleMobileMenu">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Мобільна навігація -->
    <div v-if="mobileMenuOpen" class="mobile-nav">
      <nav class="mobile-navigation">
        <ul class="mobile-nav-list">
          <li class="mobile-nav-item">
            <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
              Головна
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/courses" class="mobile-nav-link" @click="closeMobileMenu">
              Курси
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/about" class="mobile-nav-link" @click="closeMobileMenu">
              Про нас
            </router-link>
          </li>
          <li class="mobile-nav-item">
            <router-link to="/my-courses" class="mobile-nav-link" @click="closeMobileMenu">
              Мої курси
            </router-link>
          </li>
          <li class="mobile-nav-item" v-if="!isAuthenticated">
            <v-btn variant="contained" color="primary" block @click="goToLogin"> Увійти </v-btn>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      mobileMenuOpen: false,
      cartItemsCount: 0,
    }
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem('token')
    },
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },
    openCart() {
      // Логіка відкриття корзини
      console.log('Відкриваємо корзину')
    },
    openProfile() {
      this.$router.push('/profile')
    },
    goToLogin() {
      this.closeMobileMenu()
      this.$router.push('/login')
    },
    goToProfile() {
      this.$router.push('/profile')
    },
    goToMyCourses() {
      this.$router.push('/my-courses')
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.app-header {
  background-color: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  min-height: 70px;
}

/* Логотип */
.logo-section {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 12px;
}

.logo-image {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 24px;
  font-weight: bold;
  color: var(--primary-color);
}

/* Навігація */
.navigation {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  font-family: 'VinnytsiaSansReg', sans-serif;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover,
.nav-link--active {
  color: var(--primary-color);
}

.nav-link--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary-color);
}

/* Дії користувача */
.user-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-btn,
.profile-btn {
  color: var(--secondary-text-color);
}

.login-btn {
  font-family: 'VinnytsiaSansBold', sans-serif;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 8px;
  padding: 0 24px;
  height: 40px;
}

/* Мобільне меню */
.mobile-menu {
  display: none;
}

.mobile-nav {
  background-color: var(--white);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mobile-navigation {
  padding: 1rem 0;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  padding: 0.5rem 0;
}

.mobile-nav-link {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-weight: 500;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.mobile-nav-link:hover {
  background-color: var(--background-color);
  color: var(--primary-color);
}

/* Responsive стилі */
@media (max-width: 768px) {
  .navigation {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .user-actions {
    gap: 0.25rem;
  }

  .nav-list {
    gap: 1rem;
  }
}

@media (max-width: 1024px) {
  .nav-list {
    gap: 1.5rem;
  }
}
</style>
