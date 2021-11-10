<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{
          $t('transactionsAnalysis.title')
        }}</v-subheader>
      </v-col>
    </v-row>
    <v-row class="mt-1">
      <v-col>
        <v-card>
          <v-card-text>
            <v-row>
              <v-col>
                <span class="title">{{ $t('trasnsactionHistory.filter.categoryType') }}</span>
                <v-radio-group v-model="query.budgetCategoryType" :mandatory="true" column>
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
              <v-col>
                <span class="title">{{ $t('transactionsAnalysis.filter.aggregationType') }}</span>
                <v-radio-group v-model="query.groupingStep" :mandatory="true" column>
                  <template v-for="(grouping, groupingIndex) in columnGroupings">
                    <v-radio
                      :key="`gr_${groupingIndex}`"
                      color="primary"
                      :disabled="!grouping.enabled"
                      :label="grouping.name"
                      :value="grouping.value"
                    ></v-radio>
                  </template>
                </v-radio-group>
              </v-col>
              <v-col>
                <span class="title">{{ $t('transactionsAnalysis.filter.displayDataType') }}</span>
                <v-radio-group v-model="displayDataType" :mandatory="true" column>
                  <template v-for="(dataType, dataTypeIndex) in displayDataTypes">
                    <v-radio
                      :key="`dt_${dataTypeIndex}`"
                      color="primary"
                      :label="dataType.name"
                      :value="dataType.value"
                    ></v-radio>
                  </template>
                </v-radio-group>
              </v-col>
              <v-col>
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
                    v-model="selectedTransactionDateRange"
                    :min="minTransactionDateFilter"
                    :max="maxTransactionDateFilter"
                    step="days"
                  ></v-date-range-slider>
                </template>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="text-right">
        <v-btn-toggle
          v-model="displayMode"
          background-color="transparent"
          active-class="primary"
          mandatory
        >
          <v-btn :value="eDisplayMode.Table" color="transparent">
            <v-icon color="white">mdi-table-large</v-icon>
          </v-btn>

          <v-btn :value="eDisplayMode.Sparkline" color="transparent">
            <v-icon color="white">mdi-chart-line</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <template v-if="isLoading">
              <v-skeleton-loader type="table"></v-skeleton-loader>
            </template>
            <v-simple-table v-if="showDataTable">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="(header, i) in headers" :key="`th_${i}`">
                    {{ header.replaceAll(' 00:00:00', '') }}
                  </th>
                  <th>Suma</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, categoryIndex) in tableContent">
                  <tr :key="`trc_${categoryIndex}`">
                    <td>
                      <nobr>
                        <v-icon :color="color" left dark size="20">{{
                          row.budgetCategory.budgetCategoryIconKey
                        }}</v-icon>
                        {{ row.budgetCategory.name }}
                      </nobr>
                    </td>
                    <template v-if="displayMode == eDisplayMode.Table">
                      <td
                        v-for="(cellData, columnIndex) in row.columns"
                        :key="`trc_${categoryIndex}-${columnIndex}`"
                      >
                        <nobr v-if="cellData">
                          <v-tooltip v-if="cellData && cellData.change" top>
                            <template #activator="{ on }">
                              <v-icon
                                small
                                left
                                :color="changeValueColor(cellData.change)"
                                v-on="on"
                              >
                                {{ changeValueIcon(cellData.change) }}
                              </v-icon>
                            </template>
                            <nobr>
                              {{ cellData.change | percentageChange }}
                            </nobr>
                          </v-tooltip>
                          <v-icon v-else small left :color="changeValueColor(cellData.change)">
                            {{ changeValueIcon(cellData.change) }}</v-icon
                          >

                          {{ cellData.value | money }}
                        </nobr>
                      </td>
                      <td class="grey lighten-5">
                        <nobr>
                          {{ getTableRowSum(row.budgetCategory.budgetCategoryId) | money }}
                        </nobr>
                      </td>
                    </template>
                    <template v-if="displayMode == eDisplayMode.Sparkline">
                      <td :colspan="headers.length">
                        <v-sparkline
                          :value="row.columns.map(v => v.value.amount)"
                          :min="0"
                          height="40"
                          line-width="1"
                          smooth
                          padding="10"
                          label-size="3"
                          :radius="3"
                        >
                          <template #label="item">
                            {{ row.columns.find(v => v.value.amount == item.value).value | money }}
                          </template>
                        </v-sparkline>
                      </td>
                    </template>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr class="grey lighten-4">
                  <th>Suma</th>

                  <template v-if="displayMode == eDisplayMode.Table">
                    <th v-for="(cellData, columnIndex) in tableFooter" :key="`trfc_${columnIndex}`">
                      <nobr v-if="cellData">
                        <v-tooltip top>
                          <template #activator="{ on }">
                            <v-icon small left :color="changeValueColor(cellData.change)" v-on="on">
                              {{ changeValueIcon(cellData.change) }}
                            </v-icon>
                          </template>
                          <nobr v-if="cellData && cellData.change">
                            {{ cellData.change | percentageChange }}
                          </nobr>
                        </v-tooltip>

                        {{ cellData.value | money }}
                      </nobr>
                    </th>
                    <th>
                      <nobr v-if="tableFooterSum">
                        {{ tableFooterSum | money }}
                      </nobr>
                      <span v-else> - </span>
                    </th>
                  </template>
                  <template v-if="displayMode == eDisplayMode.Sparkline">
                    <th :colspan="headers.length">
                      <v-sparkline
                        :value="tableFooter.map(v => v.value.amount)"
                        :min="0"
                        height="40"
                        line-width="1"
                        smooth
                        padding="10"
                        label-size="4"
                        :radius="4"
                      >
                        <template #label="item">
                          {{ tableFooter.find(v => v.value.amount == item.value).value | money }}
                        </template>
                      </v-sparkline>
                    </th>
                  </template>
                </tr>
              </tfoot>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { Budget } from '@/typings/api/budget/GetBudgetList';

import AnalysisApi from '@/api/AnalysisApi';
import * as GetTransactionsTimeline from '@/typings/api/analysis/GetTransactionsTimeline';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import TransactionsApi from '@/api/TransactionsApi';

const budgetsStore = namespace('budgets');

enum eDisplayDataType {
  Total,
  PerDay,
  PerWeek,
  PerMonth,
}

enum eDisplayMode {
  Table,
  Sparkline,
}

@Component({
  components: {
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class TransactionsAnalysis extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  data: GetTransactionsTimeline.ResponseDto | null = null;
  eBudgetCategoryType = eBudgetCategoryType;

  minTransactionDateFilter: Date | null = null;
  maxTransactionDateFilter: Date | null = null;
  selectedTransactionDateRange: any[] = [null, null];
  // eslint-disable-next-line no-undef
  queryTimeout: any | null = null;

  eDisplayMode = eDisplayMode;
  displayMode: eDisplayMode = eDisplayMode.Table;
  displayModes = [
    { name: 'Tabela', value: eDisplayMode.Table },
    { name: 'Wykres w wierszu', value: eDisplayMode.Sparkline },
  ];

  get columnGroupings() {
    return [
      {
        name: 'Rok',
        value: GetTransactionsTimeline.eGroupingStep.Year,
        enabled: this.datesRangeFilterLength > 365,
      },
      {
        name: 'Kwartał',
        value: GetTransactionsTimeline.eGroupingStep.Quarter,
        enabled: this.datesRangeFilterLength > 365 / 4,
      },
      {
        name: 'Miesiąc',
        value: GetTransactionsTimeline.eGroupingStep.Month,
        enabled: this.datesRangeFilterLength > 30,
      },
      {
        name: 'Tydzień',
        value: GetTransactionsTimeline.eGroupingStep.Week,
        enabled: this.datesRangeFilterLength > 7,
      },
      //{ name: 'Dzień', value: GetTransactionsTimeline.eGroupingStep.Day },
    ];
  }

  displayDataType: eDisplayDataType = eDisplayDataType.PerWeek;
  displayDataTypes = [
    { name: 'Łącznie', value: eDisplayDataType.Total },
    { name: 'Dziennie', value: eDisplayDataType.PerDay },
    { name: 'Tygodniowo', value: eDisplayDataType.PerWeek },
    { name: 'Miesięcznie', value: eDisplayDataType.PerMonth },
  ];

  get headers(): string[] {
    if (!this.data) {
      return [];
    }
    return this.data.dateRanges.map(v => v.key);
  }

  get tableCategories(): BudgetCategoryDto[] {
    if (!this.categories || !this.query) {
      return [];
    }
    return this.categories.filter(v => v.budgetCategoryType == this.query.budgetCategoryType);
  }

  previousQuery: GetTransactionsTimeline.Query | null = null;
  query: GetTransactionsTimeline.Query = {
    budgetId: this.activeBudget?.budgetId,
    budgetCategoryIds: [],
    budgetCategoryType: eBudgetCategoryType.Spending,
    transactionDateStart: this.selectedTransactionDateRange[0],
    transactionDateEnd: this.selectedTransactionDateRange[1],
    groupingStep: GetTransactionsTimeline.eGroupingStep.Year,
  };

  get color(): string {
    return eBudgetCategoryType[this.query.budgetCategoryType].toLowerCase();
  }

  get datesRangeFilterLength() {
    if (!this.query.transactionDateStart || !this.query.transactionDateEnd) {
      return 0;
    }
    return Math.round(
      Math.abs(
        (this.query.transactionDateEnd.valueOf() - this.query.transactionDateStart.valueOf()) /
          (24 * 60 * 60 * 1000),
      ),
    );
  }

  get datesRangeFilterLoading() {
    return this.$wait.is('loading.transactionDatesRange');
  }
  get isLoading() {
    return (
      this.$wait.is('loading.transactionDatesRange') ||
      this.$wait.is('loading.transactionsTimeline')
    );
  }
  get showDataTable() {
    return this.data && !this.isLoading;
  }
  get showDatesRangeFilter() {
    return (
      !this.datesRangeFilterLoading &&
      this.minTransactionDateFilter &&
      this.maxTransactionDateFilter
    );
  }

  async fetchData() {
    if (this.queryTimeout) {
      clearTimeout(this.queryTimeout);
    }
    this.queryTimeout = setTimeout(() => {
      this.executeFetchData();
      this.queryTimeout = null;
    }, 500);
  }
  async executeFetchData() {
    if (
      !this.query.budgetId ||
      !this.query.transactionDateStart ||
      !this.query.transactionDateEnd
    ) {
      return;
    }
    if (this.previousQuery && JSON.stringify(this.previousQuery) == JSON.stringify(this.query)) {
      return;
    }
    this.$wait.start(`loading.transactionsTimeline`);
    try {
      this.previousQuery = Object.assign({}, this.query);
      const query = Object.assign({}, this.query);
      this.data = null;
      const data = await AnalysisApi.getTransactionsTimeline(query);
      const currentQuery = Object.assign({}, this.query);
      if (JSON.stringify(query) != JSON.stringify(currentQuery)) {
        return;
      }
      console.log(data.data);
      this.data = data.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.transactionsTimeline`);
    }
  }

  async fetchDateFilterRange() {
    if (!this.activeBudget) {
      return;
    }
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

  async mounted() {
    await this.fetchDateFilterRange();
    this.selectedTransactionDateRange = [
      this.minTransactionDateFilter,
      this.maxTransactionDateFilter,
    ];
    this.resetFilters();
  }

  resetFilters() {
    if (this.activeBudget) {
      this.query.budgetId = this.activeBudget.budgetId;
      this.query.budgetCategoryType = null;
      this.query.budgetCategoryIds = [];
      this.selectedTransactionDateRange = [
        this.minTransactionDateFilter,
        this.maxTransactionDateFilter,
      ];
    }
  }

  get tableContent() {
    if (!this.data) {
      return [];
    }
    return this.tableCategories.map(category => {
      return {
        budgetCategory: category,
        columns: this.data.dateRanges.map(v => {
          const categoryData = v.budgetCategories.find(
            b => b.budgetCategoryId == category.budgetCategoryId,
          );
          if (!categoryData) {
            return null;
          }
          switch (this.displayDataType) {
            case eDisplayDataType.Total:
              return {
                value: categoryData.amountTotal,
                change: categoryData.amountTotalChange,
              };
            case eDisplayDataType.PerDay:
              return {
                value: categoryData.amountPerDay,
                change: categoryData.amountPerDayChange,
              };
            case eDisplayDataType.PerWeek:
              return {
                value: categoryData.amountPerWeek,
                change: categoryData.amountPerWeekChange,
              };
            case eDisplayDataType.PerMonth:
              return {
                value: categoryData.amountPerMonth,
                change: categoryData.amountPerMonthChange,
              };
          }
        }),
      };
    });
  }

  get tableFooter() {
    if (!this.data) {
      return [];
    }
    return this.data.dateRanges.map(v => {
      switch (this.displayDataType) {
        case eDisplayDataType.Total:
          return {
            value: v.total.amountTotal,
            change: v.total.amountTotalChange,
          };
        case eDisplayDataType.PerDay:
          return {
            value: v.total.amountPerDay,
            change: v.total.amountPerDayChange,
          };
        case eDisplayDataType.PerWeek:
          return {
            value: v.total.amountPerWeek,
            change: v.total.amountPerWeekChange,
          };
        case eDisplayDataType.PerMonth:
          return {
            value: v.total.amountPerMonth,
            change: v.total.amountPerMonthChange,
          };
      }
    });
  }

  getTableRowSum(budgetCategoryId: string) {
    if (!this.data) {
      return null;
    }
    const brandData = this.data.budgetCategoryTotals.find(
      v => v.budgetCategoryId == budgetCategoryId,
    );
    if (!brandData) {
      return null;
    }
    switch (this.displayDataType) {
      case eDisplayDataType.Total:
        return brandData.amountTotal;
      case eDisplayDataType.PerDay:
        return brandData.amountPerDay;
      case eDisplayDataType.PerWeek:
        return brandData.amountPerWeek;
      case eDisplayDataType.PerMonth:
        return brandData.amountPerMonth;
    }
  }

  get tableFooterSum() {
    if (!this.data) {
      return null;
    }
    const data = this.data.total;
    if (!data) {
      return null;
    }
    switch (this.displayDataType) {
      case eDisplayDataType.Total:
        return data.amountTotal;
      case eDisplayDataType.PerDay:
        return data.amountPerDay;
      case eDisplayDataType.PerWeek:
        return data.amountPerWeek;
      case eDisplayDataType.PerMonth:
        return data.amountPerMonth;
    }
    return null;
  }

  changeValueIcon(value: number) {
    if (value > 0.8) return 'mdi-chevron-triple-up';
    if (value > 0.5) return 'mdi-chevron-double-up';
    if (value > 0.1) return 'mdi-chevron-up';
    if (value > -0.1) return 'mdi-minus';
    if (value > -0.5) return 'mdi-chevron-down';
    if (value > -0.8) return 'mdi-chevron-double-down';
    if (value < -0.8) return 'mdi-chevron-triple-down';
  }

  changeValueColor(value: number) {
    let scale: string[] = [
      'red darken-2',
      'amber darken-4',
      'amber darken-2',
      'blue',
      'light-green',
      'green darken-1',
      'green darken-4',
    ];
    if (this.query.budgetCategoryType != eBudgetCategoryType.Spending) {
      scale = scale.reverse();
    }

    if (value > 0.8) return scale[0];
    if (value > 0.5) return scale[1];
    if (value > 0.1) return scale[2];
    if (value > -0.1) return scale[3];
    if (value > -0.5) return scale[4];
    if (value > -0.8) return scale[5];
    if (value < -0.8) return scale[6];
  }
  setTransactionDatesQuery() {
    this.query.transactionDateStart = this.selectedTransactionDateRange[0];
    this.query.transactionDateEnd = this.selectedTransactionDateRange[1];
    if (!this.columnGroupings.find(v => v.value == this.query.groupingStep).enabled) {
      const availableGroupings = this.columnGroupings.find(v => v.enabled);
      this.query.groupingStep = availableGroupings.value;
    }
  }

  @Watch('query', { deep: true })
  onQueryChange() {
    this.fetchData();
  }
  @Watch('selectedTransactionDateRange.0')
  onSelectedRangeStartChange() {
    this.setTransactionDatesQuery();
  }
  @Watch('selectedTransactionDateRange.1')
  onSelectedRangeEndChange() {
    this.setTransactionDatesQuery();
  }

  @Watch('activeBudget')
  async onActiveBudgetChange() {
    await this.fetchDateFilterRange();
    this.resetFilters();
  }
  @Watch('categories')
  async onCategoriesChange() {
    this.resetFilters();
  }
}
</script>
