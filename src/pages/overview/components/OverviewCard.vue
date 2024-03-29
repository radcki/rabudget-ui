<template>
  <v-card :color="bodyColor" :dark="dark" :light="!dark">
    <v-card-title
      :class="`${headerColor} subtitle-2 pt-3 pb-1 mb-0 ${darkHeader ? 'white--text' : ''}`"
    >
      <div style="width: 100%">
        <v-row no-gutters>
          <v-col class="pa-0 pt-1 mt-0">
            <span class="subtitle-2 text-sm-left">{{ title }}</span>
          </v-col>

          <v-col class="pa-0 mt-0 d-flex flex-grow-0">
            <expander-button
              v-model="expanded"
              :color="darkHeader ? 'white' : 'black'"
              small
            ></expander-button>
          </v-col>
        </v-row>
        <v-row no-gutters style="min-height: 5px">
          <v-progress-linear
            v-show="loading"
            top
            class="pa-0 ma-0"
            color="white"
            height="5"
            buffer-value="0"
            query
            stream
          >
          </v-progress-linear>
        </v-row>
      </div>
    </v-card-title>
    <div :class="bodyColor" :style="`color: ${dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,1)'}`">
      <v-card-text v-show="expanded" class="py-2">
        <slot></slot>
      </v-card-text>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    ExpanderButton: () => import('@/components/ExpanderButton.vue'),
  },
})
export default class OverviewCard extends Vue {
  @Prop(String) title?: string;
  @Prop(Boolean) loading?: boolean;
  @Prop(Boolean) filled?: boolean;
  @Prop(Boolean) dark?: boolean;
  @Prop(Boolean) darkHeader?: boolean;
  @Prop(String) color?: string;

  expanded = true;

  get headerColor() {
    return this.color || 'cardBackground';
  }

  get bodyColor() {
    return (this.filled ? this.color : undefined) || undefined;
  }
}
</script>
