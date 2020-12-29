import Confirm from './Confirm.vue';
import { VueConstructor } from 'vue';
import Vuetify from 'vuetify';
import i18n from '@/plugins/i18n';

export interface ConfirmOptions {
  title: string;
  message: string;
  options: ConfirmDialogOptions;
}

export enum eDialogButtons {
  None = 0,
  Yes = 1 << 0,
  No = 1 << 1,
  Ok = 1 << 2,
  Cancel = 1 << 3,
  YesNo = Yes | No,
  OkCancel = Ok | Cancel,
}

export interface ConfirmDialogOptions {
  titleColor?: string | undefined;
  titleTextColor?: string | undefined;
  width?: number | undefined;
  input?: boolean | undefined;
  buttons: eDialogButtons;
}

export const ConfirmPlugin = {
  install(Vue: VueConstructor): void {
    const vueConstructor = Vue.extend(Confirm);
    const ConfirmInstance = new vueConstructor({
      vuetify: new Vuetify(),
      i18n,
    });

    const vm = ConfirmInstance.$mount();
    let bodyEl = document.querySelector('body');
    if (!bodyEl) {
      bodyEl = document.createElement('body');
      document.appendChild(bodyEl);
    } else {
      bodyEl.appendChild(vm.$el);
    }

    const custom = (dialogOptions: ConfirmOptions): Promise<boolean | any> =>
      ConfirmInstance.open(dialogOptions.title, dialogOptions.message, dialogOptions.options);

    const confirm = (title: string, message: string) =>
      custom({
        message: message,
        title: title,
        options: {
          buttons: eDialogButtons.YesNo,
          width: 400,
        },
      });
    const error = (title: string, message: string) =>
      custom({
        message: message,
        title: title,
        options: {
          titleColor: 'red',
          titleTextColor: 'white',
          buttons: eDialogButtons.Ok,
          width: 400,
        },
      });
    const apiError = (e: any) =>
      error(vm.$t('error.failure').toString(), Vue.prototype.$parseApiError(e));

    const success = (title: string, message: string) =>
      custom({
        message: message,
        title: title,
        options: {
          titleColor: 'success',
          titleTextColor: 'white',
          buttons: eDialogButtons.Ok,
          width: 400,
        },
      });

    // Create generic method
    Vue.prototype.$msgBox = {
      custom,
      confirm,
      error,
      success,
      apiError,
    };
  },
};
