<template>
  <div>
    <div class="text-xs-center caption">
      {{ value | money }}
      <!-- <animated-number :value="value" :format-value="formatAmount" :duration="300" /> -->
      <span v-if="subValue && subValue > 0" class="grey--text font-italic">
        ({{ subValue | money }})
        <!-- (<animated-number :value="subValue" :format-value="formatAmount" :duration="300" />) -->
      </span>
    </div>
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-progress-linear
          class="ma-0"
          :height="subValue > 0 ? 9 : 15"
          :value="100 * percent"
          :color="conditionalColor(100 * percent)"
          v-on="on"
        ></v-progress-linear>
      </template>
      <span>
        {{ percent | percentage }}
        <span v-if="subValue > 0">
          ({{ $t('transactionSchedules.inclScheduled') }}: {{ subPercent | percentage }})
        </span>
      </span>
    </v-tooltip>
    <v-progress-linear
      v-if="value != 0 && subValue > 0"
      class="ma-0"
      :height="6"
      :value="100 * subPercent"
      :color="conditionalColor(100 * (1 - subPercent))"
    ></v-progress-linear>
  </div>
</template>
<script lang="ts">
import { MoneyAmount } from '@/typings/MoneyAmount';
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    'animated-number': () => import('@/components/AnimatedNumber.vue'),
  },
})
export default class ValueBar extends Vue {
  @Prop({ type: Object }) value!: MoneyAmount;
  @Prop({ type: Object }) subValue!: MoneyAmount;
  @Prop({ type: Object }) max!: MoneyAmount;
  @Prop(Boolean) inverseColor?: boolean;

  formatAmount(value: MoneyAmount) {
    return this.$options.filters ? this.$options.filters.money(value) : value;
  }

  conditionalColor(percentValue: number): string {
    if (this.inverseColor) {
      percentValue = 100 - percentValue;
    }
    if (percentValue > 90) {
      return 'green darken-3';
    } else if (percentValue > 60) {
      return 'light-green darken-1';
    } else if (percentValue > 30) {
      return 'yellow darken-1';
    } else if (percentValue >= -1) {
      return 'orange lighten-1';
    } else if (percentValue < -1) {
      return 'deep-orange darken-4';
    }
    return '';
  }

  get percent() {
    return this.max ? (this.value.amount || 0) / this.max.amount : null;
  }
  get subPercent() {
    return this.max ? (this.subValue.amount || 0) / this.max.amount : null;
  }
}
</script>
