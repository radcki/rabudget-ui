import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import router from './router';
import { Copy } from './plugins/copy';
import { DatePlugin } from './plugins/date';
import i18n from './plugins/i18n';
import VueMarkdown from 'vue-markdown';
import VueCurrencyInput from 'vue-currency-input';
import VueCurrencyFilter from 'vue-currency-filter';
import VueWait from 'vue-wait';
import store from './store';
import signalrPlugin from './plugins/signalr';
import '@/styles/main.scss';
import { VueModalDialog } from 'vue-modal-dialog';
import IconButton from '@/components/IconButton.vue';

Vue.use(VueModalDialog);
Vue.use(Copy);
Vue.use(DatePlugin);
Vue.use(VueCurrencyInput, {});
Vue.use(VueCurrencyFilter);
Vue.use(VueMarkdown);
Vue.use(VueWait);

Vue.config.productionTip = false;

Vue.use(signalrPlugin);
Vue.component('icon-button', IconButton);

new Vue({
  store,
  vuetify,
  i18n,
  wait: new VueWait({
    useVuex: true,
  }),
  router,
  render: h => h(App),
}).$mount('#app');
