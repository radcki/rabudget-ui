<template>
  <div>
    <v-row dense>
      <v-col cols="12" sm="6">
        <date-field
          v-model="innerValue.transactionDate"
          filled
          :label="$t('transaction.transactionDate')"
        ></date-field>
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="innerValue.description"
          filled
          :label="$t('transaction.description')"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="6">
        <category-select
          v-model="innerValue.budgetCategoryId"
          :items="categories"
          :return-object="false"
          :label="$t('transaction.category')"
          filled
        ></category-select>
      </v-col>
      <v-col cols="12" sm="6">
        <money-field
          v-model="innerValue.amount"
          filled
          :label="$t('transaction.amount')"
        ></money-field>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import MoneyField from '@/components/MoneyField.vue';
import DateField from '@/components/DateField.vue';
import * as CreateTransaction from '@/typings/api/transactions/CreateTransaction';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';
import CategorySelect from '@/components/CategorySelect.vue';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
const budgetsStore = namespace('budgets');

@Component({
  components: {
    DateField,
    MoneyField,
    CategorySelect,
  },
})
export default class TransactionEditForm extends Vue {
  @Prop(Object) value!: CreateTransaction.Command;
  @Prop(Number) categoryType!: eBudgetCategoryType;

  innerValue: CreateTransaction.Command = Object.assign({}, this.value);

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;
  @budgetsStore.Getter('activeBudgetCategories') activeBudgetCategories!: BudgetCategoryDto[];

  get categories() {
    return this.activeBudgetCategories.filter(v => v.budgetCategoryType == this.categoryType);
  }

  get currencyCode(): eCurrencyCode {
    return this.activeBudget ? this.activeBudget.currency.currencyCode : 0;
  }

  @Watch('innerValue', { deep: true })
  onInnerValueChange() {
    this.$emit('input', this.innerValue);
  }

  @Watch('value')
  onValueChange(newValue) {
    this.innerValue = Object.assign(this.innerValue, newValue);
  }

  @Watch('categoryType')
  onCategoryTypeChange() {
    this.innerValue.budgetCategoryId = '';
  }

  @Watch('activeBudget')
  onBudgetChange() {
    this.innerValue.budgetCategoryId = '';
  }
}
</script>
