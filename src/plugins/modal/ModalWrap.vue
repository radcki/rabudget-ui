<template>
  <v-dialog v-model="dialogOpen" persistent :width="width">
    <v-card flat>
      <v-card-title v-if="title">
        <h4>{{ title }}</h4>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="submit()">{{ $t('general.ok') }}</v-btn>
        <v-btn text color="primary" @click="cancel()">{{ $t('general.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { ModalConfig } from './modal.component';

@Component({
  provide: function () {
    return {
      setPayload: this.setPayload,
      payload: this.payload,
      submit: this.submit,
      cancel: this.cancel,
    };
  },
})
export default class ModalWrap extends Vue {
  @Prop(Object) options!: ModalConfig;
  @Prop(Function) submitModal!: () => void;
  @Prop(Object) payload!: any;

  public dialogOpen = true;
  payloadInternal: any = Object.assign({}, this.payload);

  get width() {
    return this.options && this.options.width ? this.options.width : 500;
  }
  get title() {
    return this.options && this.options.title ? this.options.title : null;
  }

  submit() {
    this.$emit('submit', this.payloadInternal);
  }
  cancel() {
    this.$emit('cancel');
  }

  setPayload(data: any) {
    this.payloadInternal = data;
  }

  created() {
    this.$root.$on('closeDialogs', this.cancel);
  }

  beforeDestroy() {
    this.$root.$off('closeDialogs', this.cancel);
  }

  @Watch('dialogOpen')
  onDialogOpenChange(isOpen) {
    if (!isOpen) {
      this.cancel();
      this.$wait.end('dialog');
    } else {
      this.$wait.start('dialog');
    }
  }
}
</script>
