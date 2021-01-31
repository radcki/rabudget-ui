<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{ $t('overview.title') }}</v-subheader>
      </v-col>
    </v-row>
    <v-row class="mt-1">
      <v-col class="d-flex flex-grow-0" style="width: 480px">
        <v-row>
          <v-col cols="12">
            <new-transaction></new-transaction>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row dense>
          <v-col>
            <value-card
              v-if="budgetBalance"
              :value="budgetBalance.totalBalance"
              :label="$t('overview.totalBalance')"
              color="income"
              :loading="$wait.is('loading.budgetBalance*')"
            ></value-card>
          </v-col>
          <v-col>
            <value-card
              v-if="budgetBalance"
              :value="budgetBalance.unassignedFunds"
              :label="$t('overview.unassignedFunds')"
              color="blue-grey darken-1"
              :loading="$wait.is('loading.budgetBalance*')"
            ></value-card
          ></v-col>
        </v-row>
        <v-row dense class="mt-1">
          <v-col>
            <categories-balance :category-type="eBudgetCategoryType.Spending"></categories-balance>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row class="mt-1" dense>
      <v-col>
        <mini-transaction-list
          :title="$t('general.spendings')"
          :category-type="eBudgetCategoryType.Spending"
        ></mini-transaction-list>
      </v-col>
      <v-col>
        <mini-transaction-list
          :title="$t('general.incomes')"
          :category-type="eBudgetCategoryType.Income"
        ></mini-transaction-list
      ></v-col>
      <v-col>
        <mini-transaction-list
          :title="$t('general.savings')"
          :category-type="eBudgetCategoryType.Saving"
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
import { MoneyAmount } from '@/typings/MoneyAmount';
import { BudgetBalanceDto } from '@/typings/api/budget/GetBudgetBalance';
import { BalanceNotificationEvents } from '@/plugins/signalr';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'new-transaction': () => import('./components/NewTransaction.vue'),
    'mini-transaction-list': () => import('./components/MiniTransactionsList.vue'),
    'categories-balance': () => import('./components/CategoriesBalance.vue'),
    'value-card': () => import('./components/ValueCard.vue'),
  },
})
export default class Overview extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;
  eBudgetCategoryType = eBudgetCategoryType;

  budgetBalance: null | BudgetBalanceDto = null;
  unassignedFunds: null | MoneyAmount = null;

  mounted() {
    if (this.activeBudget) {
      this.fetchBudgetBalance();
    }

    this.$notificationHub.on(
      BalanceNotificationEvents.TotalBalanceChanged,
      this.fetchBudgetBalance,
    );
  }
  beforeDestroy() {
    this.$notificationHub.off(
      BalanceNotificationEvents.TotalBalanceChanged,
      this.fetchBudgetBalance,
    );
  }

  async fetchBudgetBalance() {
    this.$wait.start('loading.budgetBalance');
    try {
      const response = await BudgetApi.getBudgetsBalance({
        budgetId: this.activeBudget.budgetId,
      });
      this.budgetBalance = response.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end('loading.budgetBalance');
    }
  }

  @Watch('activeBudget')
  onBudgetChange() {
    this.fetchBudgetBalance();
  }
}
</script>
