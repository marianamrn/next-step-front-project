<!-- src\components\login-components\registration.vue -->
<template>
  <div class="registration-container">
    <!-- Left Panel (Background Image) -->
    <div class="registration-background"></div>

    <!-- Right Panel (Form Section) -->
    <div class="registration-panel">
      <div class="header-logo">
        <h1 class="logo-text">NextStep</h1>
        <img src="@/assets/img/logo.png" alt="NextStep Logo" class="registration-logo" />
      </div>

      <h1 class="registration-title">Створити акаунт</h1>

      <form class="registration-form" @submit.prevent="submit">
        <div class="input-group">
          <label class="input-label">Ім'я</label>
          <input type="text" v-model="firstName" class="registration-input" placeholder="Введіть ваше ім'я" />
        </div>

        <div class="input-group">
          <label class="input-label">Прізвище</label>
          <input type="text" v-model="lastName" class="registration-input" placeholder="Введіть ваше прізвище" />
        </div>

        <div class="input-group">
          <label class="input-label">Номер</label>
          <div class="phone-input">
            <select v-model="phoneCode" class="phone-select">
              <option value="+380">+380</option>
              <!-- Додати інші країни при потребі -->
            </select>
            <input type="text" v-model="phoneNumber" class="registration-input" placeholder="Номер телефону" />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Електронна пошта</label>
          <input type="email" v-model="email" class="registration-input" placeholder="Введіть вашу електронну адресу" />
        </div>

        <div class="input-group">
          <label class="input-label">Пароль</label>
          <div class="password-container">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="registration-input" placeholder="Створіть ваш пароль" />
            <button type="button" class="password-toggle" @click="togglePasswordVisibility">
              <img src="@/assets/icons/eye-hide.svg" alt="Show password" v-if="!showPassword">
              <img src="@/assets/icons/eye-show.svg" alt="Hide password" v-else>
            </button>
          </div>
        </div>

        <button type="submit" class="registration-button">Зареєструватися</button>

        <div class="login-link">
          <a href="#" @click.prevent="goToLogin">Вже маєте акаунт? Увійти</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterForm',
  data() {
    return {
      firstName: '',
      lastName: '',
      phoneCode: '+380',
      phoneNumber: '',
      email: '',
      password: '',
      showPassword: false
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    submit() {
      console.log('Registering:', {
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phoneCode + this.phoneNumber,
        email: this.email,
        password: this.password
      });
      // Після успішної реєстрації можна додати перехід до головної сторінки
      // this.router.push('/');
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    goToLogin() {
      this.router.push('/Login');
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VinnytsiaSansBold&display=swap');

* {
  font-family: 'VinnytsiaSansBold', sans-serif;
}

.registration-container {
  display: flex;
  height: 100vh;
}

.registration-background {
  width: 50%;
  background-image: url('@/assets/img/login-img.jpg');
  background-size: cover;
  background-position: center;
}

.registration-panel {
  width: 50%;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.header-logo {
  position: absolute;
  top: 10px;
  right: 20px;
  display: flex;
  align-items: center;
}

.registration-logo {
  width: 50px;
  height: 50px;
  margin-left: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
}

.registration-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.registration-form {
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

.registration-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 5px;
}

.phone-input {
  display: flex;
  gap: 0.5rem;
}

.phone-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background-color: white;
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

.registration-button {
  width: 100%;
  background-color: #000;
  color: #fff;
  padding: 0.5rem;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.registration-button:hover {
  background-color: #443BC9;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #000;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.login-link a:hover {
  color: #443BC9;
}
</style>