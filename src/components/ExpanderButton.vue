<template>
  <div>
    <v-tooltip v-if="tooltip && !isMobile" top>
      <template #activator="{ on }">
        <span v-on="on">
          <v-btn icon :loading="loading" :small="small" :color="color" @click="onClick()">
            <v-icon :size="small ? 20 : undefined" :style="iconStyle" class="r-animated">
              mdi-chevron-up
            </v-icon>
          </v-btn>
        </span>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
    <v-btn
      v-else
      icon
      :loading="loading"
      :small="small"
      :color="color"
      v-on="$listeners"
      @click="onClick()"
    >
      <v-icon :size="small ? 20 : undefined" :style="iconStyle" class="r-animated">
        mdi-chevron-up
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class ExpanderButton extends Vue {
  @Prop(String) tooltip!: string;
  @Prop(String) color!: string;
  @Prop(Boolean) value!: boolean;
  @Prop(Boolean) small!: boolean;
  @Prop(Boolean) loading!: boolean;

  innerValue = true;

  get iconStyle() {
    return this.innerValue
      ? {
          transform: 'rotate(0deg)',
        }
      : {
          transform: 'rotate(180deg)',
        };
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  mounted() {
    this.innerValue = this.value;
  }

  onClick() {
    this.innerValue = !this.innerValue;
    this.$emit('click');
    this.$emit('input', this.innerValue);
  }

  @Watch('value')
  onValueChange(newValue) {
    this.innerValue = newValue;
  }
}
</script>

<style>
.r-animated {
  transition: all 0.5s linear;
}
</style>
