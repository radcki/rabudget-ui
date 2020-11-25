import { format } from 'date-fns';
import { VueConstructor } from 'vue';

export const DatePlugin = {
  install(Vue: VueConstructor) {
    Date.prototype.toJSON = function () {
      return format(this, `yyyy-MM-dd'T'HH:mm:ss`);
    };

    Vue.filter('shortDate', (v: Date) => format(v, 'yyyy-MM-dd'));
  },
};
