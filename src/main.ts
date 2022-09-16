import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import { ConfirmPlugin } from './plugins/confirm/confirm.plugin';
import { ApiError } from './plugins/apiError';
import router from './router';
import { Copy } from './plugins/copy';
import { DatePlugin } from './plugins/date';
import i18n from './plugins/i18n';
import VueCurrencyInput from 'vue-currency-input';
import VueCurrencyFilter from 'vue-currency-filter';
import VueWait from 'vue-wait';
import store from './store';
import signalrPlugin from './plugins/signalr';
import '@/styles/main.scss';
import IconButton from '@/components/IconButton.vue';
import Modal from '@/plugins/modal';
import { CurrencyConfig } from '@/plugins/CurrencyConfig';
import { MoneyAmount } from './typings/MoneyAmount';
import './registerServiceWorker';

Vue.use(Modal);
Vue.use(Copy);
Vue.use(DatePlugin);
Vue.use(VueCurrencyInput, {});
Vue.use(VueCurrencyFilter);
Vue.use(VueWait);
Vue.use(ConfirmPlugin);
Vue.use(ApiError);
Vue.use(CurrencyConfig);

Vue.config.productionTip = false;

Vue.use(signalrPlugin);
Vue.component('IconButton', IconButton);
//Vue.component('InlineField', InlineField);

Vue.filter('percentage', (value, decimals) => {
  if (!value) {
    value = 0;
  }
  if (!decimals) {
    decimals = 0;
  }
  value = value * 100;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) + '%';
});
Vue.filter('percentageChange', (value, decimals) => {
  if (!value) {
    value = 0;
  }
  if (!decimals) {
    decimals = 0;
  }
  value = value * 100;
  return (
    (value > 0 ? '+' : '') +
    Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals) +
    '%'
  );
});

const app = new Vue({
  store,
  vuetify,
  i18n,
  wait: new VueWait({
    useVuex: true,
  }),
  router,
  render: h => h(App),
}).$mount('#app');

const currencyFilter = app.$root.$options.filters.currency;
const currencyConfig = app.$currencyConfig;
Vue.filter('money', (v: MoneyAmount) => {
  if (!v) {
    return '-';
  }
  return v.display || currencyFilter(v.amount, currencyConfig(v));
});
