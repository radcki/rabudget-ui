<template>
  <v-menu
    v-model="dateMenu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        ref="inputField"
        v-model="date"
        :class="classes"
        :type="inputType"
        max="9999-12-31"
        :filled="filled"
        :format="dateFormat"
        :clearable="clearable"
        :label="label"
        :dense="dense"
        :rules="rules"
        :hide-details="hideDetails"
        :prepend-icon="icon"
        :prepend-inner-icon="readonly ? 'lock' : ''"
        :readonly="readonly || disableInput"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-if="!isMobile"
      v-model="date"
      :readonly="readonly"
      :type="pickerType"
      :locale="$i18n.locale"
      @input="dateMenu = false"
    ></v-date-picker>
  </v-menu>
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
  @Prop(Boolean) filled!: boolean;
  @Prop(Boolean) dense!: boolean;
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

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }
  get classes() {
    const classList: string[] = ['r-date-field'];
    return classList;
  }

  get icon() {
    return this.dense ? undefined : 'mdi-calendar';
  }

  @Watch('date')
  OnInput(value) {
    if (isNaN(Date.parse(value)) == true) {
      return;
    }
    this.debouncedEmit('input', new Date(value));
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

  mounted() {
    this.date = !this.value ? null : format(this.value, this.dateFormat);
    this.debouncedEmit = debounce(this.$emit, 200);
  }
}
</script>
