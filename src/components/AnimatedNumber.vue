<template>
  <span>{{ moneyValue | money }}</span>
</template>
<script lang="ts">
import { MoneyAmount } from '@/typings/MoneyAmount';
import anime from 'animejs';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class AnimatedNumber extends Vue {
  @Prop({ type: Object, required: true }) value!: MoneyAmount;
  @Prop({ type: Function, default: v => v }) formatValue!: <T>(v: T) => T;
  @Prop({ type: String, default: 'linear' }) easing!: string;
  @Prop({ type: Number, default: 800 }) duration!: number;
  @Prop(Function) update!: () => void;
  @Prop(Function) begin!: () => void;
  @Prop(Function) complete!: () => void;
  @Prop(Function) run!: () => void;
  @Prop({ type: Number, default: 0 }) delay!: number;
  @Prop({ type: Number, default: 0 }) round!: number;

  animatedValue = 0;

  get moneyValue(): MoneyAmount {
    return { currencyCode: this.value.currencyCode, amount: Number(this.animatedValue) };
  }

  @Watch('value')
  OnValuechange(value: MoneyAmount) {
    this.animateValue(value.amount);
  }
  mounted() {
    this.animateValue(this.value.amount);
  }
  animateValue(value: number) {
    const { begin, easing, duration, complete, update, run, delay, round } = this;
    anime({
      targets: this,
      animatedValue: value,
      duration,
      easing,
      update,
      begin,
      complete,
      run,
      delay,
      round,
    });
  }
}
</script>
