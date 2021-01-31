<template>
  <div>
    <v-tooltip v-if="tooltip" top>
      <template #activator="{ on }">
        <span v-on="on">
          <v-btn icon :loading="loading" :small="small" :color="color" v-on="$listeners">
            <v-icon :size="small ? 20 : undefined">{{ icon }}</v-icon>
          </v-btn>
        </span>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>
    <v-btn v-else icon :loading="loading" :small="small" :color="color" v-on="$listeners">
      <v-icon :size="small ? 20 : undefined">{{ icon }}</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class IconButton extends Vue {
  @Prop(String) icon!: string;
  @Prop(String) tooltip!: string;
  @Prop(String) color!: string;
  @Prop(Boolean) small!: boolean;
  @Prop(Boolean) loading!: boolean;
}
</script>
