import Vue from 'vue';
import VueI18n from 'vue-i18n';
import VueI18nFilter from 'vue-i18n-filter';

Vue.use(VueI18nFilter);
Vue.use(VueI18n);

const messages = {
  pl: require('@/i18n/pl.json'),
  //en: require('@/i18n/en.json'),
};

export default new VueI18n({
  locale: 'pl',
  fallbackLocale: 'pl',
  messages,
});
