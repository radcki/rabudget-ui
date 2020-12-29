import { ModalComponent, ModalConfig } from './modal.component';

export class ModalService {
  init(modal: ModalComponent) {
    this.open = modal.open;
  }
  open?: (component: any, payload: any, config?: ModalConfig) => Promise<any>;
}

export const modalService = new ModalService();
