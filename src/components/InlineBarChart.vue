<template>
  <div
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="widthPercent"
    class="v-progress-linear ma-0 v-progress-linear--visible theme--light"
    style="height: 15px"
  >
    <div
      :class="`v-progress-linear__background ${color}`"
      :style="`opacity: 0.3; left: ${widthPercent}%; width: ${100 - widthPercent}%`"
    ></div>
    <div class="v-progress-linear__buffer"></div>
    <div
      :class="`v-progress-linear__determinate ${color}`"
      :style="`width: ${widthPercent}%`"
    ></div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class InlineBarChart extends Vue {
  @Prop({ type: Number }) value!: number;
  @Prop({ type: Number }) max!: number;
  @Prop({ type: String }) color!: string;

  get percent() {
    return this.max ? (this.value || 0) / this.max : null;
  }
  get widthPercent() {
    return this.percent ? Math.max(0, Math.min(100, this.percent * 100)) : 0;
  }
}
</script>
