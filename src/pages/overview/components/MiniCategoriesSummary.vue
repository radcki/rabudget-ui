<template>
  <overview-card filled :color="color" :title="title" dark dark-header>
    <v-row>
      <v-col xs4 align-center></v-col>
      <v-col xs4 align-center class="subtitle-2">{{ $t('budgetCategories.totalAmount') }}</v-col>
      <v-col xs4 align-center class="subtitle-2">{{ $t('budgetCategories.monthPlanLeft') }}</v-col>
    </v-row>

    <template v-for="(category, index) in categories">
      <v-row :key="`ct_${index}`" no-gutters class="mt-2">
        <v-col s4 align-center class="subtitle-2">
          {{ category.name }}
        </v-col>
        <v-col xs4>
          <v-skeleton-loader
            v-if="balanceIsLoading(category)"
            type="text"
            class="mx-2"
          ></v-skeleton-loader>
          <v-chip
            v-else-if="category.balance"
            class="amber darken-3 elevation-3 white--text text-body-2 d-flex mr-4"
            small
          >
            {{ category.balance.totalTransactionsBalance | money }}
          </v-chip>
        </v-col>
        <v-col xs4>
          <v-skeleton-loader
            v-if="balanceIsLoading(category)"
            type="text"
            class="mx-2"
          ></v-skeleton-loader>
          <v-chip
            v-else-if="category.balance"
            class="amber darken-3 elevation-3 white--text text-body-2 d-flex mr-4"
            small
          >
            {{ category.balance.thisMonthBudgetedAmountLeft | money }}
          </v-chip>
        </v-col>
      </v-row>
    </template>
  </overview-card>
</template>

<script lang="ts">
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';
import { BalanceNotificationEvents } from '@/plugins/signalr';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { BudgetCategoryBalanceDto } from '@/typings/api/budgetCategories/GetCurrentBudgetCategorySummary';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import OverviewCard from './OverviewCard.vue';

interface BudgetCategoryWithBalance extends BudgetCategoryDto {
  balance: BudgetCategoryBalanceDto | null;
}
const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-animated-number': () => import('@/components/AnimatedNumber.vue'),
    OverviewCard,
  },
})
export default class MiniCategoriesSummary extends Vue {
  @Prop(Number) categoryType?: eBudgetCategoryType;
  @Prop(String) title?: string;

  categories: BudgetCategoryWithBalance[] = [];
  expanded = true;

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;

  get showNoData() {
    return this.categories.length == 0;
  }

  get isLoading() {
    return this.$wait.is(`loading.budgetCategories${this.categoryType}`);
  }
  get color(): string {
    return eBudgetCategoryType[this.categoryType].toLowerCase();
  }

  formatAmount(value: MoneyAmount) {
    return this.$options.filters ? this.$options.filters.money(value) : value;
  }

  async fetchBudgetCategories() {
    this.$wait.start(`loading.budgetCategories${this.categoryType}`);
    try {
      const data = await BudgetCategoriesApi.getBudgetsCategoriesList({
        budgetId: this.activeBudget.budgetId,
        budgetCategoryTypes: [this.categoryType],
      });
      this.categories = data.data.map(v => Object.assign({ balance: null }, v));
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.budgetCategories${this.categoryType}`);
    }
  }

  async fetchBudgetCategoryBalance(budgetCategoryId: string) {
    this.$wait.start(`loading.budgetCategoryBalance${budgetCategoryId}`);
    try {
      const data = await BudgetCategoriesApi.getCurrentBudgetCategoryBalance({
        budgetCategoryIds: [budgetCategoryId],
      });
      const category = this.categories.find(v => v.budgetCategoryId == budgetCategoryId);
      if (category) {
        category.balance = data.data[0];
      }
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.budgetCategoryBalance${budgetCategoryId}`);
    }
  }

  async fetchBudgetCategoriesBalance() {
    this.$wait.start(`loading.budgetCategoriesBalance`);
    try {
      const data = await BudgetCategoriesApi.getCurrentBudgetCategoryBalance({
        budgetCategoryIds: this.categories.map(v => v.budgetCategoryId),
      });
      for (const category of this.categories) {
        category.balance = data.data.find(v => v.budgetCategoryId == category.budgetCategoryId);
      }
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.budgetCategoriesBalance`);
    }
  }

  balanceIsLoading(category: BudgetCategoryDto) {
    return (
      this.$wait.is(`loading.budgetCategoriesBalance`) ||
      this.$wait.is(`loading.budgetCategoryBalance${category.budgetCategoryId}`)
    );
  }

  mounted() {
    if (this.activeBudget) {
      this.fetchBudgetCategories();
    }
    this.$notificationHub.on(
      BalanceNotificationEvents.BudgetCategoryBalanceChanged,
      this.handleCategoryBalanceChangeNotification,
    );
  }
  beforeDestroy() {
    this.$notificationHub.off(
      BalanceNotificationEvents.BudgetCategoryBalanceChanged,
      this.handleCategoryBalanceChangeNotification,
    );
  }

  handleCategoryBalanceChangeNotification(payload) {
    this.fetchBudgetCategoryBalance(payload.budgetCategoryId);
  }

  @Watch('categories')
  onCategoryListChange() {
    this.fetchBudgetCategoriesBalance();
  }

  @Watch('activeBudget')
  onActiveBudgetChange() {
    this.fetchBudgetCategories();
  }
}
</script>
