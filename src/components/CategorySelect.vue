<template>
  <v-autocomplete
    v-model="innerValue"
    item-value="budgetCategoryId"
    item-text="name"
    v-bind="$attrs"
  >
    <template #item="{ item, on }">
      <v-list-item v-on="on">
        <v-list-item-avatar class="my-0">
          <v-icon>{{ item.budgetCategoryIconKey }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content class="py-0">
          <v-list-item-title>
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Currency } from '@/typings/Currency';
import { namespace } from 'vuex-class';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';

const dictionaries = namespace('dictionaries');

@Component
export default class CategorySelect extends Vue {
  @Prop({ type: [Object, String] }) value!: BudgetCategoryDto | string;

  innerValue: BudgetCategoryDto | string | null = this.value ? this.value : null;

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

  @dictionaries.State('currencies') currencies?: Currency[];

  filter(item: Currency, queryText: string) {
    return (
      item.code.toLowerCase().includes(queryText.toLowerCase()) ||
      item.nativeName.toLowerCase().includes(queryText.toLowerCase()) ||
      item.englishName.toLowerCase().includes(queryText.toLowerCase())
    );
  }
}
</script>
