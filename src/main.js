// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Імпорт основних стилів
import './assets/main.css'

// Імпорт Vuetify стилів та іконок
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Іпорт та налаштування Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Кастомна тема для Vuetify з кольорами платформи
const customTheme = {
  dark: false,
  colors: {
    primary: '#443BC9',
    secondary: '#5F56DC',
    accent: '#F95E15',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50',
    background: '#F4F5FF',
    surface: '#ffffff',
  },
}

// Створення інстансу Vuetify з кастомною темою
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'customTheme',
    themes: {
      customTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
  defaults: {
    global: {
      ripple: false,
    },
    VBtn: {
      style: 'text-transform: none; letter-spacing: 0;',
    },
  },
})

// Створення та монтування додатку
const app = createApp(App)

app.use(router)
app.use(vuetify)

app.mount('#app')
