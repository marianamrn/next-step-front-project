// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Додаємо наші основні стилі
import './assets/main.css'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Імпорт Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Інстанс Vuetify
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

createApp(App).use(router).use(vuetify).mount('#app')
