<template>
  <v-autocomplete
    v-model="innerValue"
    item-value="budgetCategoryId"
    item-text="name"
    :multiple="multiple"
    :items="items"
    v-bind="$attrs"
  >
    <template #item="{ item, on }">
      <v-list-item v-on="on">
        <v-list-item-avatar class="my-0">
          <v-icon :color="isSelected(item) ? categoryColor(item) : ''">{{
            item.budgetCategoryIconKey
          }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content class="py-0">
          <v-list-item-title>
            {{ item.name }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <template #prepend-item>
      <v-list-item v-if="multiple" ripple @click="toggle">
        <v-list-item-action>
          <v-icon :color="innerValue.length > 0 ? 'primary' : ''">
            {{ icon }}
          </v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title> Select All </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mt-2"></v-divider>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';

@Component
export default class CategorySelect extends Vue {
  @Prop({ type: [Object, String, Array] }) value!: BudgetCategoryDto | string | string[];
  @Prop({ type: [Array] }) items!: BudgetCategoryDto[];

  innerValue: BudgetCategoryDto | string | null | string[] = this.value ? this.value : null;

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

  get icon() {
    if (this.allSelected) return 'mdi-close-box';
    if (this.someSelected) return 'mdi-minus-box';
    return 'mdi-checkbox-blank-outline';
  }

  get multiple() {
    return Array.isArray(this.value);
  }

  get allSelected() {
    return this.multiple && (this.innerValue as string[]).length == this.items.length;
  }

  get someSelected() {
    return this.multiple && (this.innerValue as string[]).length > 0;
  }

  isSelected(category: BudgetCategoryDto) {
    return this.multiple && (this.innerValue as string[]).includes(category.budgetCategoryId);
  }

  categoryColor(category: BudgetCategoryDto): string {
    const categoryType = category.budgetCategoryType;
    return categoryType ? eBudgetCategoryType[categoryType].toLowerCase() : '';
  }

  toggle() {
    this.$nextTick(() => {
      if (this.allSelected) {
        this.innerValue = [];
      } else {
        this.innerValue = this.items.map(v => v.budgetCategoryId);
      }
    });
  }
}
</script>
