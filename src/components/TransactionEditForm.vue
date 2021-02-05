<template>
  <div>
    <v-row dense>
      <v-col>
        <date-field
          v-model="innerValue.transactionDate"
          filled
          :label="$t('transaction.transactionDate')"
        ></date-field>
      </v-col>
      <v-col>
        <v-text-field
          v-model="innerValue.description"
          filled
          :label="$t('transaction.description')"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <category-select
          v-model="innerValue.budgetCategoryId"
          :items="categories"
          :return-object="false"
          :label="$t('transaction.category')"
          filled
        ></category-select>
      </v-col>
      <v-col>
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
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import CategorySelect from '@/components/CategorySelect.vue';
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';
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

  categories: BudgetCategoryDto[] = [];

  get currencyCode(): eCurrencyCode {
    return this.activeBudget ? this.activeBudget.currency.currencyCode : 0;
  }

  async fetchBudgetCategories() {
    if (!this.activeBudget) {
      this.categories = [];
      return;
    }
    this.$wait.start(`loading.budgetCategories`);
    try {
      const data = await BudgetCategoriesApi.getBudgetsCategoriesList({
        budgetId: this.activeBudget.budgetId,
        budgetCategoryTypes: [this.categoryType],
      });
      this.categories = data.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.budgetCategories`);
    }
  }

  mounted() {
    this.fetchBudgetCategories();
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
    this.fetchBudgetCategories();
  }

  @Watch('activeBudget')
  onBudgetChange() {
    this.innerValue.budgetCategoryId = '';
    this.fetchBudgetCategories();
  }
}
</script>
