<template>
  <v-card color="cardBackground">
    <v-row class="pa-0 ma-0">
      <v-col cols="12" class="pa-5">
        <span class="title">{{ $t('trasnsactionHistory.filter.categoryType') }}</span>
        <v-radio-group v-model="query.budgetCategoryType" :mandatory="true" column>
          <v-radio color="primary" :label="$t('general.allTypes')" :value="null"></v-radio>
          <v-radio
            color="primary"
            :label="$t('general.spendings')"
            :value="eBudgetCategoryType.Spending"
          ></v-radio>
          <v-radio
            color="primary"
            :label="$t('general.incomes')"
            :value="eBudgetCategoryType.Income"
          ></v-radio>
          <v-radio
            color="primary"
            :label="$t('general.savings')"
            :value="eBudgetCategoryType.Saving"
          ></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="12" class="pa-0 ma-0"><v-divider /></v-col>

      <v-col cols="12" class="pa-5">
        <span class="title">{{ $t('trasnsactionHistory.filter.category') }}</span>
        <v-spacer class="py-2"></v-spacer>
        <v-category-select
          v-if="categories"
          v-model="query.budgetCategoryIds"
          multiple
          filled
          dense
          :items="selectedTypeCategories"
        ></v-category-select>
      </v-col>
      <v-col cols="12" class="pa-0 ma-0"><v-divider /></v-col>

      <v-col cols="12" class="pa-5">
        <span class="title">{{ $t('trasnsactionHistory.filter.transactionDate') }}</span>
        <v-spacer class="py-2"></v-spacer>
        <template v-if="datesRangeFilterLoading">
          <v-row dense>
            <v-col cols="6">
              <v-skeleton-loader type="chip"></v-skeleton-loader>
            </v-col>
            <v-col cols="6">
              <v-skeleton-loader type="chip"></v-skeleton-loader>
            </v-col>
            <v-col cols="12">
              <v-skeleton-loader type="text"></v-skeleton-loader>
            </v-col>
          </v-row>
        </template>
        <template v-if="showDatesRangeFilter">
          <v-date-range-slider
            v-model="selectedRange"
            :min="minTransactionDateFilter"
            :max="maxTransactionDateFilter"
            step="days"
          ></v-date-range-slider>
        </template>
      </v-col>
      <v-col cols="12" class="pa-0 ma-0"><v-divider /></v-col>
    </v-row>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="resetFilters()">{{ $t('general.reset') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format } from 'date-fns';

import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import * as GetTransactionList from '@/typings/api/transactions/GetTransactionList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import TransactionsApi from '@/api/TransactionsApi';
import { TransactionNotificationEvents } from '@/plugins/signalr';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class FilterBox extends Vue {
  @Prop(Object) value!: GetTransactionList.Query;
  query: GetTransactionList.Query = Object.assign({}, this.value);
  previousQuery: GetTransactionList.Query = Object.assign({}, this.value);

  selectedRange: any[] = [null, null];

  minTransactionDateFilter: Date | null = null;
  maxTransactionDateFilter: Date | null = null;

  format = format;
  eBudgetCategoryType = eBudgetCategoryType;

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  get selectedTypeCategories(): BudgetCategoryDto[] {
    return this.categories.filter(
      v => v.budgetCategoryType == this.query.budgetCategoryType || !this.query.budgetCategoryType,
    );
  }

  get showTransactionsList() {
    return true;
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  get datesRangeFilterLoading() {
    return this.$wait.is('loading.transactionDatesRange');
  }
  get showDatesRangeFilter() {
    return (
      !this.datesRangeFilterLoading &&
      this.minTransactionDateFilter &&
      this.maxTransactionDateFilter
    );
  }
  async mounted() {
    if (this.activeBudget) {
      await this.fetchDateFilterRange();
      this.resetFilters();
    }

    this.$notificationHub.on(
      TransactionNotificationEvents.TransactionUpdated,
      this.fetchDateFilterRange,
    );
    this.$notificationHub.on(
      TransactionNotificationEvents.TransactionListChanged,
      this.fetchDateFilterRange,
    );
  }
  beforeDestroy() {
    this.$notificationHub.off(
      TransactionNotificationEvents.TransactionUpdated,
      this.fetchDateFilterRange,
    );
    this.$notificationHub.off(
      TransactionNotificationEvents.TransactionListChanged,
      this.fetchDateFilterRange,
    );
  }

  resetFilters() {
    this.query.budgetCategoryType = null;
    this.query.budgetCategoryIds = this.selectedTypeCategories.map(v => v.budgetCategoryId);
    this.selectedRange = [this.minTransactionDateFilter, this.maxTransactionDateFilter];
  }
  categoryIcon(budgetCategoryId): string {
    return (
      this.categories.find(v => v.budgetCategoryId == budgetCategoryId)?.budgetCategoryIconKey || ''
    );
  }
  categoryName(budgetCategoryId): string {
    return this.categories.find(v => v.budgetCategoryId == budgetCategoryId)?.name || '';
  }
  categoryColor(budgetCategoryId): string {
    const categoryType = this.categories.find(v => v.budgetCategoryId == budgetCategoryId)
      ?.budgetCategoryType;

    return categoryType ? eBudgetCategoryType[categoryType].toLowerCase() : '';
  }

  async fetchDateFilterRange() {
    this.$wait.start(`loading.transactionDatesRange`);
    try {
      const result = await TransactionsApi.getTransactionsDatesRange({
        budgetId: this.activeBudget.budgetId,
      });
      this.minTransactionDateFilter = result.data.minDate;
      this.maxTransactionDateFilter = result.data.maxDate;
    } catch (error) {
      this.$msgBox.apiError(error);
      this.minTransactionDateFilter = null;
      this.maxTransactionDateFilter = null;
    } finally {
      this.$wait.end(`loading.transactionDatesRange`);
    }
  }

  setTransactionDatesQuery() {
    this.query.transactionDateStart = this.selectedRange[0];
    this.query.transactionDateEnd = this.selectedRange[1];
  }

  @Watch('activeBudget')
  async onBudgetChange() {
    await this.fetchDateFilterRange();
    this.resetFilters();
  }
  @Watch('categories')
  async onCategoriesChange() {
    this.resetFilters();
  }

  @Watch('query.budgetCategoryType')
  onCategoryTypeChange() {
    const ids = this.selectedTypeCategories.map(v => v.budgetCategoryId);
    this.query.budgetCategoryIds = this.query.budgetCategoryIds.filter(v => ids.includes(v));
  }

  @Watch('value', { deep: true })
  onValueChange(newValue: GetTransactionList.Query) {
    if (JSON.stringify(newValue) != JSON.stringify(this.query)) {
      this.query = Object.assign(this.query, newValue);
    }
  }

  @Watch('query', { deep: true })
  onFiltersChange(newQuery) {
    if (JSON.stringify(newQuery) != JSON.stringify(this.previousQuery)) {
      this.$emit('input', Object.assign({}, newQuery));
    }
    this.previousQuery = Object.assign({}, newQuery);
  }

  @Watch('selectedRange.0')
  onSelectedRangeStartChange() {
    this.setTransactionDatesQuery();
  }
  @Watch('selectedRange.1')
  onSelectedRangeEndChange() {
    this.setTransactionDatesQuery();
  }
}
</script>
