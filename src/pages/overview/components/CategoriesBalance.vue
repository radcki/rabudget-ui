<template>
  <v-card>
    <v-card-text class="px-4 pb-1">
      <v-list subheader>
        <v-row v-if="!isMobile" no-gutters class="text-center">
          <v-col :cols="3"></v-col>
          <v-col class="px-1 subtitle-2">
            {{ $t('budgetCategories.currentBalance') }}
          </v-col>
          <v-col class="px-1 subtitle-2">
            {{ $t('budgetCategories.spendingThisMonth') }}
          </v-col>
          <v-col class="px-1 subtitle-2">
            {{ $t('budgetCategories.yearBalance') }}
          </v-col>
        </v-row>
        <v-row v-for="(category, i) in categories" :key="i" no-gutters class="mt-2">
          <v-col :cols="3">
            <v-avatar :color="color" size="30" class="mr-4">
              <v-icon dark size="20">{{ category.budgetCategoryIconKey }}</v-icon>
            </v-avatar>
            {{ category.name }}
          </v-col>
          <template>
            <v-col class="px-1">
              <v-skeleton-loader
                v-if="balanceIsLoading(category)"
                type="text@2"
              ></v-skeleton-loader>
              <value-bar
                v-else-if="category.balance"
                :value="category.balance.totalCategoryBalance"
                :max="category.currentBudgetedAmount"
              ></value-bar>
            </v-col>
            <v-col class="px-1">
              <v-skeleton-loader
                v-if="balanceIsLoading(category)"
                type="text@2"
              ></v-skeleton-loader>
              <value-bar
                v-else-if="category.balance"
                :value="category.balance.thisMonthTransactionsTotal"
                inverse-color
                :max="category.currentBudgetedAmount"
              ></value-bar>
            </v-col>
            <v-col class="px-1">
              <v-skeleton-loader
                v-if="balanceIsLoading(category)"
                type="text@2"
              ></v-skeleton-loader>
              <value-bar
                v-else-if="category.balance"
                :value="category.balance.budgetLeftToEndOfYear"
                :max="category.currentBudgetedAmount"
              ></value-bar>
            </v-col>
          </template>
        </v-row>
      </v-list>
      <div v-if="showNoData" class="text-center pa-3 pb-5">
        <h3>{{ $t('budgetCategories.noCategories') }}</h3>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';
import { BudgetCategoryBalanceDto } from '@/typings/api/budgetCategories/GetBudgetCategoryBalance';
import ValueBar from '@/components/ValueBar.vue';
import { BalanceNotificationEvents } from '@/plugins/signalr';

const budgetsStore = namespace('budgets');

interface BudgetCategoryWithBalance extends BudgetCategoryDto {
  balance: BudgetCategoryBalanceDto | null;
}

@Component({
  components: {
    ValueBar,
  },
})
export default class CategoriesBalance extends Vue {
  @Prop(Number) categoryType?: eBudgetCategoryType;

  categories: BudgetCategoryWithBalance[] = [];

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
  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
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
      const data = await BudgetCategoriesApi.getBudgetCategoryBalance({
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
      const data = await BudgetCategoriesApi.getBudgetCategoryBalance({
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
