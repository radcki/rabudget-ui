<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{ $t('overview.title') }}</v-subheader>
      </v-col>
    </v-row>
    <v-row class="mt-1 align-start">
      <v-col
        cols="12"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="4"
        class="d-flex flex-grow-0"
        :style="!isMobile ? { width: 480 } : {}"
      >
        <v-row>
          <v-col v-if="!isMobile" cols="12">
            <new-transaction></new-transaction>
          </v-col>
          <v-col cols="12">
            <mini-categories-summary
              :title="$t('budgetCategories.savingBalanceTitle')"
              :category-type="eBudgetCategoryType.Saving"
            ></mini-categories-summary>
          </v-col>
        </v-row>
      </v-col>
      <v-col xs="12" sm="12" md="12" lg="6" xl="8">
        <v-row>
          <v-col :cols="isMobile ? 12 : 6">
            <value-card
              :value="budgetBalance ? budgetBalance.totalBalance : null"
              :label="$t('overview.totalBalance')"
              color="income"
              :loading="$wait.is('loading.budgetBalance*')"
            ></value-card>
          </v-col>
          <v-col :cols="isMobile ? 12 : 6">
            <value-card
              :value="budgetBalance ? budgetBalance.unassignedFunds : null"
              :label="$t('overview.unassignedFunds')"
              color="blue-grey darken-1"
              :loading="$wait.is('loading.budgetBalance*')"
            ></value-card
          ></v-col>
        </v-row>
        <v-row>
          <v-col>
            <categories-balance
              :title="$t('budgetCategories.categoriesBalanceTitle')"
              :category-type="eBudgetCategoryType.Spending"
            ></categories-balance>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <mini-transaction-list
          :title="$t('general.spendings')"
          :category-type="eBudgetCategoryType.Spending"
        ></mini-transaction-list>
      </v-col>
      <v-col cols="12" md="4">
        <mini-transaction-list
          :title="$t('general.incomes')"
          :category-type="eBudgetCategoryType.Income"
        ></mini-transaction-list
      ></v-col>
      <v-col cols="12" md="4">
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
    'mini-categories-summary': () => import('./components/MiniCategoriesSummary.vue'),
  },
})
export default class Overview extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;
  eBudgetCategoryType = eBudgetCategoryType;

  budgetBalance: null | BudgetBalanceDto = null;
  unassignedFunds: null | MoneyAmount = null;

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }
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
