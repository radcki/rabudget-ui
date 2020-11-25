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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { modalService } from 'vue-modal-dialog';

@Component({})
export default class ModalWrap extends Vue {
  @Prop(Object) options!: any;

  public dialogOpen = true;

  get width() {
    return this.options && this.options.width ? this.options.width : 500;
  }
  get title() {
    return this.options && this.options.title ? this.options.title : null;
  }

  submit() {
    modalService.submit();
  }
  cancel() {
    modalService.cancel();
  }

  @Watch('dialogOpen')
  onDialogOpenChange(isOpen) {
    if (!isOpen) {
      this.cancel();
    }
  }
}
</script>
