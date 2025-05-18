<template>
  <section class="contact-us-banner">
    <div class="container">
      <div class="banner-content">
        <p class="banner-text">
          Ти крутий спеціаліст, який хоче поділитися своїми знаннями з усім світом?
          <a href="#" @click.prevent="openContactModal" class="banner-link"> Напиши нам </a>
        </p>
      </div>
    </div>

    <!-- Модальне вікно контактної форми -->
    <v-dialog v-model="contactModalOpen" max-width="500px" persistent>
      <v-card class="contact-modal">
        <v-card-title class="modal-header">
          <span class="modal-title">Зв'яжіться з нами</span>
          <v-btn icon variant="text" @click="closeContactModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="modal-content">
          <v-form ref="contactForm" v-model="formValid">
            <v-text-field
              v-model="contactForm.email"
              label="Електронна пошта"
              type="email"
              variant="outlined"
              :rules="emailRules"
              prepend-inner-icon="mdi-email-outline"
              class="form-field"
              required
            />

            <v-text-field
              v-model="contactForm.fullName"
              label="Прізвище та ім'я"
              variant="outlined"
              :rules="nameRules"
              prepend-inner-icon="mdi-account-outline"
              class="form-field"
              required
            />

            <v-textarea
              v-model="contactForm.message"
              label="Ваше повідомлення"
              variant="outlined"
              :rules="messageRules"
              prepend-inner-icon="mdi-message-outline"
              rows="4"
              class="form-field"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-spacer />
          <v-btn variant="text" color="secondary" @click="closeContactModal"> Скасувати </v-btn>
          <v-btn
            variant="contained"
            color="primary"
            :disabled="!formValid || sending"
            :loading="sending"
            @click="submitContactForm"
          >
            Відправити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar для повідомлень -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top timeout="4000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Закрити </v-btn>
      </template>
    </v-snackbar>
  </section>
</template>

<script>
export default {
  name: 'ContactUs',
  data() {
    return {
      contactModalOpen: false,
      formValid: false,
      sending: false,
      contactForm: {
        email: '',
        fullName: '',
        message: '',
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
      emailRules: [
        (v) => !!v || "Email обов'язковий",
        (v) => /.+@.+\..+/.test(v) || 'Email має бути дійсним',
      ],
      nameRules: [
        (v) => !!v || "Прізвище та ім'я обов'язкові",
        (v) => v.length >= 2 || "Прізвище та ім'я мають містити щонайменше 2 символи",
      ],
      messageRules: [
        (v) => !!v || "Повідомлення обов'язкове",
        (v) => v.length >= 10 || 'Повідомлення має містити щонайменше 10 символів',
      ],
    }
  },
  methods: {
    openContactModal() {
      this.contactModalOpen = true
    },
    closeContactModal() {
      this.contactModalOpen = false
      this.resetForm()
    },
    resetForm() {
      this.contactForm = {
        email: '',
        fullName: '',
        message: '',
      }
      this.formValid = false
      if (this.$refs.contactForm) {
        this.$refs.contactForm.resetValidation()
      }
    },
    async submitContactForm() {
      if (!this.formValid) return

      this.sending = true

      try {
        // Тут буде логіка відправки форми до API
        // Поки що імітуємо успішну відправку
        await new Promise((resolve) => setTimeout(resolve, 1500))

        this.showSnackbar('Ваше повідомлення успішно відправлено!', 'success')
        this.closeContactModal()
      } catch (error) {
        console.error('Помилка відправки форми:', error)
        this.showSnackbar('Помилка відправки повідомлення. Спробуйте ще раз.', 'error')
      } finally {
        this.sending = false
      }
    },
    showSnackbar(message, color = 'success') {
      this.snackbar = {
        show: true,
        message,
        color,
      }
    },
  },
}
</script>

<style scoped>
.contact-us-banner {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 1rem 0;
  position: relative;
}

.banner-content {
  text-align: center;
}

.banner-text {
  font-family: 'VinnytsiaSansReg', sans-serif;
  font-size: 1rem;
  color: var(--white);
  margin: 0;
  line-height: 1.4;
}

.banner-link {
  color: var(--accent-yellow);
  text-decoration: underline;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.banner-link:hover {
  color: var(--white);
  text-decoration: none;
}

/* Модальне вікно */
.contact-modal {
  border-radius: 16px;
  overflow: hidden;
}

.modal-header {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-family: 'VinnytsiaSansBold', sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
}

.modal-content {
  padding: 2rem;
}

.form-field {
  margin-bottom: 1rem;
}

.modal-actions {
  padding: 1rem 2rem;
  background-color: var(--light-gray);
}

/* Responsive стилі */
@media (max-width: 768px) {
  .banner-text {
    font-size: 0.9rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .banner-text {
    font-size: 0.85rem;
  }

  .modal-header {
    padding: 1rem 1.5rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-actions {
    padding: 1rem;
  }
}
</style>
