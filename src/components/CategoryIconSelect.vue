<template>
  <v-select
    v-model="innerValue"
    item-value="budgetCategoryIconId"
    :filled="filled"
    :items="budgetCategoryIcons"
    :loading="$wait.is('loading.categoryIcons')"
    :return-object="returnObject"
    style="max-width: 60px"
    :label="label"
  >
    <template #item="{ item }">
      <v-icon :color="color">{{ item.iconKey }}</v-icon>
    </template>

    <template #selection="{ item }">
      <v-icon :color="color">{{ item.iconKey }}</v-icon>
    </template>
  </v-select>
</template>

<script lang="ts">
import { BudgetCategoryIconDto } from '@/typings/api/dictionaries/GetBudgetCategoryIcons';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const dictionaries = namespace('dictionaries');

@Component
export default class CategoryIconSelect extends Vue {
  @Prop({ type: [Object, Number, String] }) value!: string | BudgetCategoryIconDto;
  @Prop(Boolean) returnObject!: boolean;
  @Prop(Boolean) filled!: boolean;
  @Prop(String) label!: string;
  @Prop(String) color!: string;

  innerValue: string | BudgetCategoryIconDto | null = this.value ? this.value : null;

  created() {
    this.innerValue = this.value ? this.value : null;
  }
  @Watch('innerValue')
  onInnerValueChange(newValue) {
    this.$emit('input', newValue);
  }

  @Watch('value')
  onValueChange(newValue) {
    if (newValue != this.innerValue) {
      this.innerValue = newValue;
    }
  }

  @dictionaries.State('budgetCategoryIcons') budgetCategoryIcons?: BudgetCategoryIconDto[];
}
</script>
