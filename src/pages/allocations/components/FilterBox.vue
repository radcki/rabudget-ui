<template>
  <v-card color="cardBackground" :min-width="!isMobile && !isCollapsed ? 350 : ''">
    <v-row class="pa-0 ma-0">
      <v-col>
        <span class="title">{{ $t('trasnsactionHistory.filter.title') }}</span>
      </v-col>
      <v-col v-if="isMobile" class="d-flex flex-grow-0">
        <icon-button
          :icon="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
          @click="isCollapsed = !isCollapsed"
        ></icon-button>
      </v-col>

      <v-col v-if="!isMobile" class="d-flex flex-grow-0">
        <icon-button
          :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="isCollapsed = !isCollapsed"
        ></icon-button>
      </v-col>
    </v-row>
    <v-row v-show="!isCollapsed" class="pa-0 ma-0">
      <v-col cols="12" class="pa-5">
        <span class="title">{{ $t('allocationHistory.filter.targetCategory') }}</span>
        <v-spacer class="py-2"></v-spacer>
        <v-category-select
          v-if="categories"
          v-model="query.targetBudgetCategoryIds"
          multiple
          filled
          dense
          :items="selectedTypeTargetCategories"
        ></v-category-select>
      </v-col>
      <v-col cols="12" class="pa-0 ma-0"><v-divider /></v-col>
      <v-col cols="12" class="pa-5">
        <span class="title">{{ $t('allocationHistory.filter.sourceCategory') }}</span>
        <v-spacer class="py-2"></v-spacer>
        <v-category-select
          v-if="categories"
          v-model="query.sourceBudgetCategoryIds"
          multiple
          filled
          dense
          :items="selectedTypeSourceCategories"
        ></v-category-select>
      </v-col>
      <v-col cols="12" class="pa-0 ma-0"><v-divider /></v-col>

      <v-col cols="12" class="pa-5">
        <span class="title">{{ $t('allocationHistory.filter.allocationDate') }}</span>
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
            :min="minAllocationDateFilter"
            :max="maxAllocationDateFilter"
            step="days"
          ></v-date-range-slider>
        </template>
      </v-col>
      <v-col cols="12" class="pa-0 ma-0"><v-divider /></v-col>
    </v-row>
    <v-card-actions v-show="!isCollapsed">
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
import * as GetAllocationList from '@/typings/api/allocations/GetAllocationList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import AllocationsApi from '@/api/AllocationsApi';
import { AllocationNotificationEvents } from '@/plugins/signalr';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class FilterBox extends Vue {
  @Prop(Object) value!: GetAllocationList.Query;
  query: GetAllocationList.Query = Object.assign({}, this.value);
  previousQuery: GetAllocationList.Query = Object.assign({}, this.value);

  selectedRange: any[] = [null, null];

  minAllocationDateFilter: Date | null = null;
  maxAllocationDateFilter: Date | null = null;

  isCollapsed = false;

  format = format;
  eBudgetCategoryType = eBudgetCategoryType;

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  get selectedTypeTargetCategories(): BudgetCategoryDto[] {
    return this.categories.filter(
      v =>
        v.budgetCategoryType == this.query.targetBudgetCategoryType ||
        !this.query.targetBudgetCategoryType,
    );
  }
  get selectedTypeSourceCategories(): BudgetCategoryDto[] {
    return this.categories.filter(
      v =>
        v.budgetCategoryType == this.query.sourceBudgetCategoryType ||
        !this.query.sourceBudgetCategoryType,
    );
  }

  get showAllocationsList() {
    return true;
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  get datesRangeFilterLoading() {
    return this.$wait.is('loading.allocationDatesRange');
  }
  get showDatesRangeFilter() {
    return (
      !this.datesRangeFilterLoading && this.minAllocationDateFilter && this.maxAllocationDateFilter
    );
  }
  async mounted() {
    if (this.activeBudget) {
      await this.fetchDateFilterRange();
      this.resetFilters();
    }

    this.$notificationHub.on(
      AllocationNotificationEvents.AllocationUpdated,
      this.fetchDateFilterRange,
    );
    this.$notificationHub.on(
      AllocationNotificationEvents.AllocationListChanged,
      this.fetchDateFilterRange,
    );
  }
  beforeDestroy() {
    this.$notificationHub.off(
      AllocationNotificationEvents.AllocationUpdated,
      this.fetchDateFilterRange,
    );
    this.$notificationHub.off(
      AllocationNotificationEvents.AllocationListChanged,
      this.fetchDateFilterRange,
    );
  }

  resetFilters() {
    this.query.sourceBudgetCategoryType = null;
    this.query.sourceBudgetCategoryIds = [];
    this.query.targetBudgetCategoryType = null;
    this.query.targetBudgetCategoryIds = [];
    this.selectedRange = [this.minAllocationDateFilter, this.maxAllocationDateFilter];
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
    this.$wait.start(`loading.allocationDatesRange`);
    try {
      const result = await AllocationsApi.getAllocationsDatesRange({
        budgetId: this.activeBudget.budgetId,
      });
      this.minAllocationDateFilter = result.data.minDate;
      this.maxAllocationDateFilter = result.data.maxDate;
    } catch (error) {
      this.$msgBox.apiError(error);
      this.minAllocationDateFilter = null;
      this.maxAllocationDateFilter = null;
    } finally {
      this.$wait.end(`loading.allocationDatesRange`);
    }
  }

  setAllocationDatesQuery() {
    this.query.allocationDateStart = this.selectedRange[0];
    this.query.allocationDateEnd = this.selectedRange[1];
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

  @Watch('query.sourceBudgetCategoryType')
  onSourceCategoryTypeChange() {
    const ids = this.selectedTypeSourceCategories.map(v => v.budgetCategoryId);
    this.query.sourceBudgetCategoryIds = this.query.sourceBudgetCategoryIds.filter(v =>
      ids.includes(v),
    );
  }

  @Watch('query.targetBudgetCategoryType')
  onTargetCategoryTypeChange() {
    const ids = this.selectedTypeTargetCategories.map(v => v.budgetCategoryId);
    this.query.targetBudgetCategoryIds = this.query.targetBudgetCategoryIds.filter(v =>
      ids.includes(v),
    );
  }

  @Watch('value', { deep: true })
  onValueChange(newValue: GetAllocationList.Query) {
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
    this.setAllocationDatesQuery();
  }
  @Watch('selectedRange.1')
  onSelectedRangeEndChange() {
    this.setAllocationDatesQuery();
  }
}
</script>
