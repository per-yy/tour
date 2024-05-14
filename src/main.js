import './assets/main.css'

import router from '@/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-persistedstate-plugin'
import App from './App.vue'


const app=createApp(App);
const pinia = createPinia();
const persist = createPersistedState();
app.use(pinia);
pinia.use(persist);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
