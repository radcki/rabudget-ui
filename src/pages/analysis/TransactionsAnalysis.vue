<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{
          this.$t('transactionsAnalysis.title')
        }}</v-subheader>
      </v-col>
    </v-row>
    <v-row class="mt-1">
      <v-col>
        <v-card>
          <v-card-text>
            <v-row>
              <v-col>
                <v-select
                  v-model="columnGrouping"
                  :items="columnGroupings"
                  item-text="name"
                  item-value="value"
                  :return-object="false"
                ></v-select>
              </v-col>
              <v-col>
                <v-select
                  v-model="displayDataType"
                  :items="displayDataTypes"
                  item-text="name"
                  item-value="value"
                  :return-object="false"
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <v-simple-table>
              <thead>
                <tr>
                  <td></td>
                  <td v-for="(header, i) in headers" :key="`th_${i}`">
                    {{ header }}
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(budgetCategory, categoryIndex) in tableCategories"
                  :key="`trc_${categoryIndex}`"
                >
                  <td>
                    {{ budgetCategory.name }}
                  </td>
                  <td v-for="(key, keyIndex) in headers" :key="`trc_${categoryIndex}-${keyIndex}`">
                    <nobr>
                      {{ getTableCellValue(key, budgetCategory.budgetCategoryId) | money }}
                    </nobr>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
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

@Component({
  components: {},
})
export default class TransactionsAnalysis extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  data: GetTransactionsTimeline.ResponseDto | null = null;

  selectedBudgetCategoryType: eBudgetCategoryType = eBudgetCategoryType.Spending;
  minTransactionDateFilter: Date | null = null;
  maxTransactionDateFilter: Date | null = null;

  columnGrouping: GetTransactionsTimeline.eGroupingStep =
    GetTransactionsTimeline.eGroupingStep.Year;
  columnGroupings = [
    { name: 'Rok', value: GetTransactionsTimeline.eGroupingStep.Year },
    { name: 'Kwartał', value: GetTransactionsTimeline.eGroupingStep.Quarter },
    { name: 'Miesiąc', value: GetTransactionsTimeline.eGroupingStep.Month },
    { name: 'Tydzień', value: GetTransactionsTimeline.eGroupingStep.Week },
    { name: 'Dzień', value: GetTransactionsTimeline.eGroupingStep.Day },
  ];

  displayDataType: eDisplayDataType = eDisplayDataType.Total;
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
    if (!this.categories) {
      return [];
    }
    return this.categories.filter(v => v.budgetCategoryType == this.query.budgetCategoryType);
  }

  get query(): GetTransactionsTimeline.Query | null {
    if (!this.activeBudget || !this.minTransactionDateFilter || !this.maxTransactionDateFilter) {
      return null;
    }
    return {
      budgetId: this.activeBudget.budgetId,
      budgetCategoryIds: [],
      budgetCategoryType: this.selectedBudgetCategoryType,
      transactionDateStart: this.minTransactionDateFilter,
      transactionDateEnd: this.maxTransactionDateFilter,
      groupingStep: this.columnGrouping,
    };
  }

  async fetchData() {
    if (!this.query) {
      return;
    }
    this.$wait.start(`loading.transactionsTimeline`);
    try {
      const query = Object.assign({}, this.query);
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
  created() {
    this.fetchDateFilterRange();
  }
  mounted() {
    this.fetchData();
  }

  getTableCellValue(key: string, budgetCategoryId: string) {
    if (!this.data) {
      return null;
    }
    const dateRange = this.data.dateRanges.find(v => v.key == key);
    const brandData = dateRange.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId);
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

  @Watch('query')
  onQueryChange() {
    this.fetchData();
  }

  @Watch('activeBudget')
  onActiveBudgetChange() {
    this.fetchDateFilterRange();
  }
}
</script>
