import '@/utils/axios';

import './assets/main.scss';
import '//at.alicdn.com/t/c/font_4547657_nge0p6ryx1.js';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import Icon from '@/components/Icon.vue';
import ElementPlus from 'element-plus';

// element css
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import App from '~/App.vue';
import router from '~/router';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.use(ElementPlus, {
  locale: zhCn,
});
app.component('Icon', Icon);

app.mount('#app');
