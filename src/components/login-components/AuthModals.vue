<template>
  <div>
    <!-- Модальні вікна авторизації -->
    <login-form 
      v-if="activeModal === 'login'" 
      @close="closeModals" 
      @switch-to-register="switchModal('registration')"
    ></login-form>

    <register-form 
      v-if="activeModal === 'registration'" 
      @close="closeModals" 
      @switch-to-login="switchModal('login')"
    ></register-form>
  </div>
</template>

<script>
import LoginForm from '@/components/login-components/login.vue';
import RegisterForm from '@/components/login-components/registration.vue';

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