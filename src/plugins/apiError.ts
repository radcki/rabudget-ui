import { VueConstructor } from 'vue';
import i18n from './i18n';

class ApiErrorPlugin {
  install(Vue: VueConstructor) {
    Vue.prototype.$parseApiError = (error: any): string => {
      console.dir(error);
      if (error && error.response && error.response.data) {
        const problem = error.response.data as ApiProblem;
        return problem.detail;
      }
      return i18n.t('error.generic').toString();
    };
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $parseApiError(error: any): string;
  }
}

export interface ApiProblem {
  detail: string;
  status: number;
}

export const ApiError = new ApiErrorPlugin();
