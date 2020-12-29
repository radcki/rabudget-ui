<template>
  <div :class="wrapperClass">
    <div v-if="prependIcon" class="v-input__prepend-outer">
      <div class="v-input__icon v-input__icon--prepend">
        <v-icon>{{ prependIcon }}</v-icon>
      </div>
    </div>
    <div class="v-input__control">
      <div class="v-input__slot">
        <div class="v-text-field__slot">
          <label
            v-if="label"
            :class="labelClass"
            style="left: 0px; right: auto; position: absolute"
          >
            {{ label }}
          </label>
          <currency-input
            v-if="currencyCode"
            ref="inputField"
            v-model="innerValue.amount"
            :readonly="readonly"
            :currency="currencyCode"
            locale="PL"
            @focus="hasFocus = true"
            @blur="onBlur"
            @keyup="$emit('keyup', $event)"
          />
          <input
            v-else
            ref="inputField"
            v-model="innerValue.amount"
            :readonly="readonly"
            type="number"
            step="0.01"
            @focus="hasFocus = true"
            @blur="onBlur"
            @keyup="$emit('keyup', $event)"
          />
        </div>
      </div>
      <div v-if="!hideDetails" class="v-text-field__details">
        <div class="v-messages theme--dark">
          <div class="v-messages__wrapper">
            <div v-if="errors.length > 0" class="v-messages theme--dark error--text" role="alert">
              <div class="v-messages__wrapper">
                <div class="v-messages__message">{{ $t('error.fieldRequired') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.r-date-field input {
  -webkit-appearance: none;
}
.r-date-field input::-webkit-calendar-picker-indicator,
.r-date-field input::-webkit-clear-button,
.r-date-field input::-webkit-inner-spin-button {
  display: none;
  -webkit-appearance: none;
}
</style>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';

@Component({
  inject: {
    form: {
      default: null,
    },
  },
})
export default class MoneyField extends Vue {
  @Prop(Object) value!: MoneyAmount;
  @Prop(String) label!: string;
  @Prop(Array) rules!: ((v) => boolean | string)[];
  @Prop(Boolean) clearable!: boolean;
  @Prop(Boolean) filled!: boolean;
  @Prop(Boolean) readonly!: boolean;
  @Prop(Boolean) dense!: boolean;
  @Prop(Boolean) hideDetails!: boolean;
  @Prop(String) prependIcon!: any;

  innerValue: MoneyAmount = this.value
    ? this.value
    : {
        amount: 0,
        currencyCode: null,
      };
  hasFocus = false;

  errors: string[] = [];

  get currencyCode() {
    return this.innerValue.currencyCode ? eCurrencyCode[this.innerValue.currencyCode] : '';
  }

  mounted() {
    if ((this as any).form) {
      (this as any).form.register(this);
    }
  }

  focus() {
    const field = this.$refs['inputField'] as HTMLElement;
    if (field) {
      if (field.tagName == 'input') {
        field.focus();
      } else {
        (field as any).$el.focus();
      }
    }
  }

  validate() {
    const errors: string[] = [];
    let rules: ((v) => boolean | string)[] = [];
    if (this.rules) {
      rules = [...this.rules];
    }
    for (const test of rules) {
      if (typeof test(this.innerValue) == 'string') {
        errors.push(test(this.innerValue) as string);
      }
    }
    this.errors = errors;
    return this.errors.length == 0;
  }

  resetValidation() {
    this.$nextTick(() => {
      this.errors = [];
    });
  }

  reset() {
    this.$nextTick(() => {
      this.innerValue = null;
      this.errors = [];
    });
  }

  generateWarning(child: string, parent: string) {
    return () => console.warn(`The ${child} component must be used inside a ${parent}`);
  }

  get labelClass(): string {
    const classes: string[] = ['v-label'];
    if (this.innerValue != null || this.hasFocus) {
      classes.push('v-label--active');
    }
    if (this.hasFocus) {
      classes.push('primary--text');
    }
    if (this.errors.length > 0) {
      classes.push('error--text');
    }
    if (this.$vuetify.theme.dark) {
      classes.push('theme--dark');
    } else {
      classes.push('theme--light');
    }
    return classes.join(' ');
  }

  get wrapperClass(): string[] {
    const classes: string[] = ['v-input v-text-field', 'v-text-field--is-booted'];

    if (this.innerValue != null || this.hasFocus) {
      classes.push('v-input--is-label-active');
    }

    if (this.hasFocus) {
      classes.push('v-input--is-focused primary--text');
    }
    if (this.hasFocus || this.errors.length > 0) {
      classes.push('v-input--has-state');
    }

    if (this.$vuetify.theme.dark) {
      classes.push('theme--dark');
    } else {
      classes.push('theme--light');
    }
    if (this.errors.length > 0) {
      classes.push('error--text');
    }
    if (this.filled) {
      classes.push('v-text-field--enclosed');
      classes.push('v-text-field--filled');
    }
    if (this.hideDetails) {
      classes.push('v-input--hide-details');
    }
    if (!this.label) {
      classes.push('v-text-field--single-line');
    }
    if (this.dense) {
      classes.push('v-input--dense');
    }
    return classes;
  }

  onBlur() {
    this.hasFocus = false;
    this.$emit('blur');
  }

  @Watch('value')
  onValueChange(value) {
    if (value != this.innerValue) {
      this.innerValue = value;
      this.validate();
    }
  }

  @Watch('innerValue')
  onInput(value) {
    if (this.value != value) {
      this.$emit('input', value);
    }
  }
}
</script>
