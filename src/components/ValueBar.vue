<template>
  <div>
    <div class="text-xs-center caption">
      <v-row no-gutters>
        <v-col class="text-no-wrap">{{ value | money }} </v-col>
        <v-col class="d-flex flex-grow-0 text-no-wrap grey--text">/ {{ max | money }}</v-col>
      </v-row>

      <!-- <animated-number :value="value" :format-value="formatAmount" :duration="300" /> -->
      <span v-if="subValue && subValue > 0" class="grey--text font-italic">
        ({{ subValue | money }})
        <!-- (<animated-number :value="subValue" :format-value="formatAmount" :duration="300" />) -->
      </span>
    </div>
    <v-tooltip bottom>
      <template #activator="{ on }">
        <div v-on="on">
          <inline-bar-chart
            :max="1"
            :value="percent"
            :color="conditionalColor(100 * percent)"
          ></inline-bar-chart>
        </div>
      </template>
      <span>
        {{ percent | percentage }}
        <span v-if="subValue > 0">
          ({{ $t('transactionSchedules.inclScheduled') }}: {{ subPercent | percentage }})
        </span>
      </span>
    </v-tooltip>
    <div v-if="value != 0 && subValue > 0">
      <inline-bar-chart
        :max="1"
        :value="subValue"
        :color="conditionalColor(100 * (1 - subPercent))"
      ></inline-bar-chart>
    </div>
  </div>
</template>
<script lang="ts">
import { MoneyAmount } from '@/typings/MoneyAmount';
import { Vue, Component, Prop } from 'vue-property-decorator';
import InlineBarChart from './InlineBarChart.vue';

@Component({
  components: {
    'animated-number': () => import('@/components/AnimatedNumber.vue'),
    InlineBarChart,
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
