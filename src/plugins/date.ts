import { format } from 'date-fns';
import { VueConstructor } from 'vue';
import plDateLocale from 'date-fns/locale/pl';
import enDateLocale from 'date-fns/locale/en-GB';
import i18n from './i18n';

const dateLocales = {
  pl: plDateLocale,
  en: enDateLocale,
};

export const DatePlugin = {
  install(Vue: VueConstructor) {
    Date.prototype.toJSON = function () {
      return format(this, `yyyy-MM-dd`);
    };

    Vue.filter('shortDate', (v: Date) => (!v ? '-' : format(v, 'yyyy-MM-dd')));
    Vue.filter('monthDate', (v: Date) => (!v ? '-' : format(v, 'yyyy-MM')));
    Vue.filter('dateFormat', (value, formatString, locale: string | null) => {
      const dateLocale = dateLocales[locale || i18n.locale];
      return !value ? '-' : format(value, formatString || 'yyyy-MM-dd', { locale: dateLocale });
    });
  },
};
