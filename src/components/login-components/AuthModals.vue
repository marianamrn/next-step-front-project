<template>
    <div>
      <!-- Модальні вікна авторизації -->
      <login-form 
        v-if="activeModal === 'login'" 
        @close="closeModals" 
        @switch-to-register="switchModal('register')"
        @switch-to-reset="switchModal('reset')"
      />
      
      <register-form 
        v-if="activeModal === 'register'" 
        @close="closeModals" 
        @switch-to-login="switchModal('login')"
      />
    </div>
  </template>
  
  <script>
  import LoginForm from '@/components/login/login.vue';
  import RegisterForm from '@/components/login/register.vue';
  
  export default {
    name: 'AuthModals',
    components: {
      LoginForm,
      RegisterForm
    },
    data() {
      return {
        activeModal: null
      };
    },
    methods: {
      openModal(modalType) {
        this.activeModal = modalType;
      },
      switchModal(modalType) {
        this.activeModal = modalType;
      },
      closeModals() {
        this.activeModal = null;
      }
    }
  };
  </script>