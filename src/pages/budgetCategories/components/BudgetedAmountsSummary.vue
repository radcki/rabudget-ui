<template>
  <v-card>
    <v-card-text class="text-center">
      <template v-if="!showNoData">
        <v-row dense>
          <v-col></v-col>
          <v-col class="subtitle-2">Aktualnie zabudżetowane</v-col>
          <v-col class="subtitle-2">Zabudżetowane na ten rok</v-col>
          <v-col class="subtitle-2">Zabudżetowane do tej pory</v-col>
        </v-row>
        <v-row class="mt-1" no-gutters>
          <v-col>{{ $t('general.spendings') }}</v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.spendingSummary.currentBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.spendingSummary.thisYearBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.spendingSummary.totalBudgetedAmount"
            ></animated-number>
          </v-col>
        </v-row>

        <v-row class="mt-1" no-gutters>
          <v-col>{{ $t('general.incomes') }}</v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.incomeSummary.currentBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.incomeSummary.thisYearBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.incomeSummary.totalBudgetedAmount"
            ></animated-number>
          </v-col>
        </v-row>

        <v-row class="mt-1" no-gutters>
          <v-col>{{ $t('general.savings') }}</v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.savingSummary.currentBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.savingSummary.thisYearBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col>
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.savingSummary.totalBudgetedAmount"
            ></animated-number>
          </v-col>
        </v-row>

        <v-row class="mt-1" no-gutters>
          <v-col class="subtitle-2">{{ $t('general.balance') }}</v-col>
          <v-col :class="data ? balanceValueClass(data.totalSummary.currentBudgetedAmount) : ''">
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.totalSummary.currentBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col :class="data ? balanceValueClass(data.totalSummary.thisYearBudgetedAmount) : ''">
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.totalSummary.thisYearBudgetedAmount"
            ></animated-number>
          </v-col>
          <v-col :class="data ? balanceValueClass(data.totalSummary.totalBudgetedAmount) : ''">
            <v-skeleton-loader v-if="isLoading" type="text" class="mx-2"></v-skeleton-loader>
            <animated-number
              v-else
              :value="data.totalSummary.totalBudgetedAmount"
            ></animated-number>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';
import * as GetBudgetedAmountsSummary from '@/typings/api/budgetCategories/GetBudgetedAmountsSummary';
import { namespace } from 'vuex-class';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { BalanceNotificationEvents } from '@/plugins/signalr';
import AnimatedNumber from '@/components/AnimatedNumber.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: { AnimatedNumber },
})
export default class BudgetedAmountsSummary extends Vue {
  data: GetBudgetedAmountsSummary.SummaryDto | null = null;

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;

  get isLoading() {
    return this.$wait.is(`loading.budgetedAmountSummary`);
  }
  get showNoData() {
    return !this.data && !this.isLoading;
  }

  async fetchBudgetAmountsSummary() {
    this.$wait.start(`loading.budgetedAmountSummary`);
    try {
      const data = await BudgetCategoriesApi.getBudgetedAmountsSummary({
        budgetId: this.activeBudget.budgetId,
      });
      this.data = data.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.budgetedAmountSummary`);
    }
  }

  balanceValueClass(value: MoneyAmount) {
    const classes = ['subtitle-2'];
    if (value.amount < 0) {
      classes.push('red--text');
    } else {
      classes.push('green--text');
    }
    return classes;
  }

  mounted() {
    if (this.activeBudget) {
      this.fetchBudgetAmountsSummary();
    }
    this.$notificationHub.on(
      BalanceNotificationEvents.TotalBalanceChanged,
      this.fetchBudgetAmountsSummary,
    );
  }

  beforeDestroy() {
    this.$notificationHub.off(
      BalanceNotificationEvents.TotalBalanceChanged,
      this.fetchBudgetAmountsSummary,
    );
  }

  @Watch('activeBudget')
  onActiveBudgetChange() {
    this.fetchBudgetAmountsSummary();
  }
}
</script>
