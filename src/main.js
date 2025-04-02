import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// Імпорт Vuetify
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Інстанс Vuetify
const vuetify = createVuetify({
  components,
  directives,
});

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app');