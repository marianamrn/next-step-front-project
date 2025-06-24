// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Імпорт основних стилів
import './assets/main.css'
import './assets/fonts.css'

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

// Простий toast плагін
const toastPlugin = {
  install(app) {
    app.config.globalProperties.$toast = {
      success(message) {
        this.show(message, 'success')
      },
      error(message) {
        this.show(message, 'error')
      },
      warning(message) {
        this.show(message, 'warning')
      },
      info(message) {
        this.show(message, 'info')
      },
      show(message, type = 'info') {
        // Створюємо елемент для toast
        const toast = document.createElement('div')
        toast.className = `toast toast-${type}`
        toast.innerHTML = `
          <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
          </div>
        `
        
        // Додаємо стилі
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          max-width: 400px;
          animation: slideIn 0.3s ease-out;
        `
        
        // Додаємо CSS анімацію
        if (!document.getElementById('toast-styles')) {
          const style = document.createElement('style')
          style.id = 'toast-styles'
          style.textContent = `
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .toast-content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            }
            .toast-message {
              flex: 1;
              font-size: 14px;
              font-weight: 500;
            }
            .toast-close {
              background: none;
              border: none;
              color: white;
              font-size: 18px;
              cursor: pointer;
              padding: 0;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              transition: background-color 0.2s;
            }
            .toast-close:hover {
              background-color: rgba(255, 255, 255, 0.2);
            }
          `
          document.head.appendChild(style)
        }
        
        // Додаємо до DOM
        document.body.appendChild(toast)
        
        // Автоматично видаляємо через 5 секунд
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove()
          }
        }, 5000)
      }
    }
  }
}

// Створення та монтування додатку
const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(toastPlugin)

app.mount('#app')
