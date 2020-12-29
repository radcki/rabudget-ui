import { ModalService } from './modal.service';

declare module 'vue/types/vue' {
  interface Vue {
    $modal: ModalService;
  }
}
