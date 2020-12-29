import { VueConstructor } from 'vue';
import { modalService } from './modal.service';
import ModalComponent from './modal.component';

class ModalPlugin {
  install(vue: VueConstructor) {
    vue.prototype.$modal = modalService;
    vue.component('r-modal', ModalComponent);
  }
}
export default new ModalPlugin();
