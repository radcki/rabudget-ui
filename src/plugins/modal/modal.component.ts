import { VNode } from 'vue';
import Vue from 'vue';
import { VueConstructor } from 'vue/types/umd';
import { modalService } from './modal.service';
import ModalWrap from './ModalWrap.vue';

export interface ModalData {
  component: VueConstructor<Vue>;
  payload?: any;
  props?: any;
  config: ModalConfig;
  resolve?: (value?: any) => void;
  reject?: (value?: any) => void;
}

export interface ModalConfig {
  title?: string;
  width?: number;
  persistent?: boolean;
  closeOnEsc?: boolean;
}

export interface ModalComponent extends VueConstructor<Vue> {
  open: (component: VueConstructor<Vue>, payload?: any, config?: ModalConfig) => Promise<any>;
  submit?: (payload: any) => void;
  reject?: () => void;
}

export default Vue.extend({
  name: 'RDialog',
  data() {
    return {
      modalList: [],
    };
  },

  mounted() {
    modalService.init(this);
  },

  methods: {
    addModal(modal: ModalData) {
      this.modalList.push(modal);
    },

    closeModal(modal: ModalData, data: any) {
      if ((this.modalList as ModalData[]).length == 0) {
        return;
      }
      const modals = this.modalList as ModalData[];
      const index = modals.indexOf(modal);
      modals.splice(index, 1);
      modal.resolve(data);
    },

    open(component: VueConstructor<Vue>, payload: any, config?: ModalConfig, props?: any) {
      const modalData: ModalData = {
        component: component,
        payload: payload,
        props: props,
        config: Object.assign(
          {
            title: null,
            width: 700,
            persistent: false,
            closeOnEsc: true,
          },
          config || {},
        ),
      };
      const promise = new Promise((resolve, reject) => {
        modalData.resolve = resolve;
        modalData.reject = reject;
      });
      this.addModal(modalData);
      return promise;
    },
  },

  render(h): VNode {
    const close = this.closeModal;
    return h(
      'div',
      {
        class: {
          ...this.themeClasses,
        },
        attrs: {
          ...this.$attrs,
        },
        on: this.$listeners,
      },
      [
        ...this.modalList.map((modal: ModalData, index) => [
          h(
            ModalWrap,
            {
              props: {
                options: modal.config,
                payload: modal.payload,
              },
              on: {
                submit: function (payload) {
                  close(modal, payload);
                },
                cancel: function () {
                  close(modal, null);
                },
              },
              style: { zIndex: 1000 + index + 1 },
            },
            [h(modal.component, { props: modal.props })],
          ),
        ]),
      ],
    );
  },
});
