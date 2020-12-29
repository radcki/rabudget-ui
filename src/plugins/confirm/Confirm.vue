<template>
  <v-dialog :key="componentKey" v-model="dialog" :max-width="options.width" @keydown.esc="cancel">
    <v-card flat>
      <v-card-title v-if="title" :class="options.titleColor">
        <h4 :class="titleTextClass">{{ title }}</h4>
      </v-card-title>
      <v-card-text v-show="!!message" class="pa-3">
        <vue-markdown>{{ message }}</vue-markdown>
      </v-card-text>
      <v-card-text v-if="options.input">
        <v-text-field v-model="input" :type="options.input"></v-text-field>
      </v-card-text>
      <v-card-text v-if="options.select">
        <v-select
          v-model="selection"
          :items="options.selectList"
          item-text="text"
          item-value="value"
          return-object
          single-line
          :label="message"
        ></v-select>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn v-if="showOk" color="primary" text @click.native="agree">{{
          $t('general.ok')
        }}</v-btn>
        <v-btn v-if="showYes" color="primary" text @click.native="agree">{{
          $t('general.yes')
        }}</v-btn>
        <v-btn v-if="showCancel" color="primary" text @click.native="cancel">{{
          $t('general.cancel')
        }}</v-btn>
        <v-btn v-if="showNo" color="primary" text @click.native="cancel">{{
          $t('general.no')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import VueMarkdown from 'vue-markdown';
import { ConfirmDialogOptions, eDialogButtons } from './confirm.plugin';

@Component({
  components: {
    'vue-markdown': VueMarkdown,
  },
})
export default class VueConfirm extends Vue {
  defaultOptions: ConfirmDialogOptions = {
    titleColor: 'transparent',
    titleTextColor: undefined,
    width: 290,
    input: false,
    buttons: eDialogButtons.Ok,
  };

  options: ConfirmDialogOptions = Object.assign({}, this.defaultOptions);
  selection: any = null;
  dialog = false;
  input: any = null;
  inputType = 'text';
  resolve: any = null;
  reject: any = null;
  message = '';
  title = '';
  componentKey = this.generateKey();

  get showOk() {
    return this.options.buttons & eDialogButtons.Ok;
  }
  get showCancel() {
    return this.options.buttons & eDialogButtons.Cancel;
  }
  get showYes() {
    return this.options.buttons & eDialogButtons.Yes;
  }
  get showNo() {
    return this.options.buttons & eDialogButtons.No;
  }

  get titleTextClass() {
    if (!this.options.titleTextColor) {
      return '';
    }
    const parts = this.options.titleTextColor.split(' ');
    const classess: string[] = [];
    classess.push(parts[0] + '--text');
    if (parts.length > 0) {
      classess.push('text--' + parts[1]);
    }
    return classess.join(' ');
  }

  beforeDestroy(): void {
    this.$wait.end('dialog');
  }

  open(title: string, message: string, options: ConfirmDialogOptions): Promise<boolean | any> {
    this.reset();

    this.title = title;
    this.message = message;
    this.options = Object.assign(this.options, options);
    this.dialog = true;
    return new Promise<boolean | any>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  reset() {
    this.componentKey = this.generateKey();
    this.input = null;
    this.inputType = 'text';
    this.resolve = null;
    this.reject = null;
    this.message = '';
    this.title = '';
    this.options = Object.assign({}, this.defaultOptions);
  }

  generateKey() {
    return new Date().valueOf() + Math.random();
  }

  agree(): void {
    if (this.options.input) {
      this.resolve(this.input);
    } else {
      this.resolve(true);
    }
    this.dialog = false;
  }

  cancel(): void {
    this.resolve(false);
    this.dialog = false;
  }
}
</script>
