import { ConfirmOptions, ConfirmDialogOptions } from './confirm.plugin';

declare module 'vue/types/vue' {
  interface Vue {
    $msgBox: MessageBox;
    open(title: string, message: string, options: ConfirmDialogOptions): Promise<boolean | any>;
  }
}

interface MessageBox {
  custom: (options: ConfirmOptions) => Promise<boolean | any>;
  confirm: (title: string, message: string) => Promise<boolean>;
  error: (title: string, message: string) => Promise<boolean>;
  apiError: (error: any) => Promise<boolean>;
  success: (title: string, message: string) => Promise<boolean>;
}
