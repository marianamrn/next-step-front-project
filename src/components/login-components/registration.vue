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
            <v-btn icon x-small class="password-toggle" @click="togglePasswordVisibility">
              <v-icon>{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
            </v-btn>
          </div>
        </div>

        <v-btn 
          type="submit" 
          color="black" 
          block 
          height="42" 
          class="registration-button"
        >Зареєструватися</v-btn>

        <div class="login-link">
          <a href="#" @click.prevent="goToLogin">Вже маєте акаунт? Увійти</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/services/api'
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
    async submit() {
      const registrationData = {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email,
        phone: this.phoneCode + this.phoneNumber,
        password: this.password,
        password_confirmation: this.password
      };

      try {
        const response = await authAPI.registerStudent(registrationData);
        console.log('Реєстрація успішна:', response.data);
        alert('Реєстрація пройшла успішно!');
        this.router.push('/Login');
      } catch (error) {
        console.error('Помилка при реєстрації:', error.message || error);
        alert('Помилка: ' + (error.response?.data?.message || 'Будь ласка, перевірте дані.'));
      }
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
  position: absolute !important;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.password-toggle {
    background-color: transparent !important;
    box-shadow: none !important;
    min-width: unset !important;
    padding: 0 !important;
    height: auto !important;
    width: auto !important;
  }

.registration-button {
  width: 100%;
  font-weight: bold !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
}

.registration-button:hover {
  background-color: #443BC9 !important;
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