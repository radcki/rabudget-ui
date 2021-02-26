<template>
  <v-date-picker
    v-model="date"
    :readonly="readonly"
    :type="pickerType"
    :locale="$i18n.locale"
    @input="dateMenu = false"
  ></v-date-picker>
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
import { format } from 'date-fns';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { debounce } from 'debounce';

@Component
export default class DateField extends Vue {
  @Prop(Date) value!: Date;
  @Prop(String) label!: string;
  @Prop(Array) rules!: ((v) => boolean | string)[];
  @Prop(Boolean) clearable!: boolean;
  @Prop(Boolean) readonly!: boolean;
  @Prop(Boolean) disableInput!: boolean;
  @Prop(Boolean) hideDetails!: boolean;
  @Prop(String) type!: 'date' | 'month';

  date: string | null = null;
  dateMenu = false;
  debouncedEmit: any = null;

  get pickerType() {
    return this.type == 'month' ? 'month' : 'date';
  }

  get inputType() {
    if (this.disableInput) {
      return 'text';
    }
    return this.type == 'month' ? 'month' : 'date';
  }

  get dateFormat() {
    return this.pickerType == 'date' ? 'yyyy-MM-dd' : 'yyyy-MM';
  }

  @Watch('date')
  OnInput(value) {
    if (isNaN(Date.parse(value)) == true) {
      return;
    }
    if (format(new Date(value), this.dateFormat) != format(this.value, this.dateFormat)) {
      this.debouncedEmit('input', new Date(value));
    }
  }

  @Watch('dateMenu')
  onCalendarOpenClose(isOpen) {
    if (!isOpen) {
      setTimeout(() => {
        this.debouncedEmit('change', new Date(this.date));
      }, 250);
    }
  }

  @Watch('value')
  OnValueChange(value) {
    this.date = !value ? null : format(value, this.dateFormat);
  }

  focus() {
    const field = this.$refs['inputField'];
    if (field) {
      const inputs = ((field as Vue).$el as HTMLElement).getElementsByTagName('input');
      if (inputs.length > 0) {
        inputs[0].dispatchEvent(new Event('click'));
      }
    }
  }

  created() {
    this.date = !this.value ? null : format(this.value, this.dateFormat);
    this.debouncedEmit = debounce(this.$emit, 200);
  }
}
</script>
