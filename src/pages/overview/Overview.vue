<template>
  <v-container fluid>
    <v-row>
      <v-col class="d-flex flex-grow-0" style="width: 480px">
        <new-transaction
          @spending-created="handleSpendingCreated"
          @income-created="handleIncomeCreated"
          @saving-created="handleSavingCreated"
        ></new-transaction>
      </v-col>
      <v-col></v-col>
    </v-row>
    <v-row>
      <v-col>
        <mini-transaction-list
          :title="$t('general.spendings')"
          :category-type="eBudgetCategoryType.Spending"
          @provide-reload="setSpendingReload"
        ></mini-transaction-list>
      </v-col>
      <v-col>
        <mini-transaction-list
          :title="$t('general.incomes')"
          :category-type="eBudgetCategoryType.Income"
          @provide-reload="setIncomeReload"
        ></mini-transaction-list
      ></v-col>
      <v-col>
        <mini-transaction-list
          :title="$t('general.savings')"
          :category-type="eBudgetCategoryType.Saving"
          @provide-reload="setSavingReload"
        ></mini-transaction-list
      ></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import BudgetApi from '@/api/BudgetApi';

const budgetsStore = namespace('budgets');

interface ExposedMethods {
  fetchSpendingTransactions: null | (() => Promise<void>);
  fetchIncomeTransactions: null | (() => Promise<void>);
  fetchSavingTransactions: null | (() => Promise<void>);
}

@Component({
  components: {
    'new-transaction': () => import('./components/NewTransaction.vue'),
    'mini-transaction-list': () => import('./components/MiniTransactionsList.vue'),
  },
})
export default class Overview extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;
  eBudgetCategoryType = eBudgetCategoryType;

  exposedMethods: ExposedMethods = {
    fetchSpendingTransactions: null,
    fetchIncomeTransactions: null,
    fetchSavingTransactions: null,
  };
  mounted() {
    if (this.activeBudget) {
      this.fetchBudgetBalance();
    }
  }
  setSpendingReload(fn: () => Promise<void>) {
    this.exposedMethods.fetchSpendingTransactions = fn;
  }
  setSavingReload(fn: () => Promise<void>) {
    this.exposedMethods.fetchSavingTransactions = fn;
  }
  setIncomeReload(fn: () => Promise<void>) {
    this.exposedMethods.fetchIncomeTransactions = fn;
  }
  handleSpendingCreated() {
    if (this.exposedMethods.fetchSpendingTransactions) {
      this.exposedMethods.fetchSpendingTransactions();
    }
  }
  handleSavingCreated() {
    if (this.exposedMethods.fetchSpendingTransactions) {
      this.exposedMethods.fetchSavingTransactions();
    }
  }
  handleIncomeCreated() {
    if (this.exposedMethods.fetchSpendingTransactions) {
      this.exposedMethods.fetchIncomeTransactions();
    }
  }

  async fetchBudgetBalance() {
    const response = await BudgetApi.getBudgetsBalance({
      budgetId: this.activeBudget.budgetId,
    });
    console.log(response);
  }

  @Watch('activeBudget')
  onBudgetChange() {
    this.fetchBudgetBalance();
  }
}
</script>
