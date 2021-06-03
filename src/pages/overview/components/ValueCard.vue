<template>
  <overview-card filled :color="color" :loading="loading" :title="label" dark>
    <div class="display-1 pb-1 text-center">
      <span v-if="value">{{ value | money }}</span>
      <span v-else>-</span>
    </div>
  </overview-card>
</template>

<script lang="ts">
import { MoneyAmount } from '@/typings/MoneyAmount';
import { Vue, Component, Prop } from 'vue-property-decorator';
import OverviewCard from './OverviewCard.vue';

@Component({
  components: {
    'animated-number': () => import('@/components/AnimatedNumber.vue'),
    'expander-button': () => import('@/components/ExpanderButton.vue'),
    OverviewCard,
  },
})
export default class ValueCard extends Vue {
  @Prop(Object) value?: MoneyAmount;
  @Prop(String) label?: string;
  @Prop(Boolean) loading?: string;
  @Prop(String) color?: string;

  expanded = true;
}
</script>
