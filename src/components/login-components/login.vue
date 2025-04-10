<!-- src\components\login-components\login.vue -->
<template>
  <div class="login-container">
    <!-- Left Panel (Login Section) -->
    <div class="login-panel">
      <div class="header-logo">
        <h1 class="logo-text">NextStep</h1>
        <img src="@/assets/img/logo.png" alt="NextStep Logo" class="login-logo" />
      </div>
      <h1 class="login-title">Увійти в акаунт</h1>
      
      <form @submit.prevent="submit" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="input-group">
          <label class="input-label">Електронна пошта</label>
          <input type="email" v-model="email" class="login-input" placeholder="Введіть вашу електронну адресу" />
        </div>
        <div class="input-group">
          <label class="input-label">Пароль</label>
          <div class="password-container">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="login-input" placeholder="Введіть ваш пароль" />
            <button type="button" class="password-toggle" @click="togglePasswordVisibility">
              <img src="@/assets/icons/eye-hide.svg" alt="Show password" v-if="!showPassword">
              <img src="@/assets/icons/eye-show.svg" alt="Hide password" v-else>
            </button>
          </div>
        </div>
        <div class="forgot-password">
          <a href="#">Забули пароль?</a>
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Зачекайте...' : 'Увійти' }}
        </button>
      </form>
      
      <div class="register-link">
        <a href="#" @click.prevent="goToRegister">Не маєте акаунту? Створити акаунт</a>
      </div>
    </div>
    
    <!-- Right Panel (Background Image Section) -->
    <div class="login-background"></div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { authAPI } from '@/services/api.js';

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: null
    };
  },

  setup() {
    const router = useRouter();
    return { router };
  },

  methods: {
    async submit() {
      if (!this.email || !this.password) {
        this.error = 'Будь ласка, введіть email та пароль';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      // Передаємо дані та router до сервісу авторизації
      const credentials = {
        email: this.email,
        password: this.password
      };
      
      const result = await authAPI.authenticate(credentials, this.router);
      
      if (!result.success) {
        this.error = result.errorMessage;
      }
      
      this.loading = false;
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    
    goToRegister() {
      this.router.push('/register');
    }
  }
};
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansBold&display=swap');

  * {
    font-family: 'VinnytsiaSansBold', sans-serif;
  }

  .login-container {
    display: flex;
    height: 100vh;
  }

  .header-logo {
    display: flex;
    align-items: center;
    position: absolute;
    top: 10px;
    left: 10px;
  }

  .login-logo {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .logo-text {
    font-size: 20px;
    font-weight: bold;
  }

  .login-panel {
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
    padding: 2rem;
  }

  .login-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .login-form {
    width: 75%;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  .input-label {
    display: block;
    color: #0B091B;
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .login-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
  }

  .password-container {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .password-toggle img {
    width: 24px;
    height: 24px;
  }

  .forgot-password {
    text-align: left;
    margin-bottom: 1rem;
    margin-left: 0;
  }

  .forgot-password a,
  .register-link a {
    color: #000;
    font-size: 0.9rem;
    transition: color 0.3s;
  }

  .forgot-password a:hover,
  .register-link a:hover {
    color: #443BC9;
  }

  .login-button {
    width: 100%;
    background-color: #000;
    color: #fff;
    padding: 0.5rem;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
    border: none;
  }

  .login-button:hover {
    background-color: #443BC9;
  }

  .login-button:disabled {
    background-color: #666;
    cursor: not-allowed;
  }

  .register-link {
    margin-top: 1rem;
  }

  .login-background {
    width: 50%;
    background-image: url('@/assets/img/login-img.jpg');
    background-size: cover;
    background-position: center;
  }

  .error-message {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #f87171;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
</style>