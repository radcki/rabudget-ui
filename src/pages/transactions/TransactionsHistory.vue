<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{
          $t('trasnsactionHistory.title')
        }}</v-subheader>
      </v-col>
    </v-row>
    <v-row no>
      <v-col v-if="filtersVisible" class="d-flex flex-grow-0" style="min-width: 350px">
        <v-row no-gutters>
          <v-col>
            <filter-box v-model="query"></filter-box>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col cols="2">
                <icon-button
                  v-if="filtersVisible"
                  color="white"
                  icon="mdi-chevron-left"
                  :tooltip="$t('trasnsactionHistory.hideFilters')"
                  @click="hideFilters()"
                ></icon-button>
                <icon-button
                  v-if="!filtersVisible"
                  color="white"
                  icon="mdi-chevron-right"
                  :tooltip="$t('trasnsactionHistory.hideFilters')"
                  @click="showFilters()"
                ></icon-button>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="4">
                <v-text-field
                  v-if="$vuetify.breakpoint.smAndUp"
                  v-model="query.search"
                  append-icon="mdi-magnify"
                  :label="$t('general.search')"
                  single-line
                  solo
                  hide-details
                  @keyup.enter="fetchTransactions()"
                  @click:append="fetchTransactions()"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <template v-if="isLoading && isMobile" xs12 class="text-xs-center">
              <v-progress-circular
                :size="70"
                :width="7"
                color="amber darken-3"
                indeterminate
              ></v-progress-circular>
            </template>

            <v-card
              v-if="showTransactionsList"
              style="width: 100%"
              class="elevation-1 cardBackground"
            >
              <v-card-text>
                <v-data-table
                  v-if="$vuetify.breakpoint.smAndUp"
                  :headers="headers"
                  :items="transactions"
                  :loading="$wait.is('loading.*')"
                  :search="search"
                  item-key="transactionId"
                  disable-pagination
                  hide-default-footer
                  :server-items-length="totalTransactions"
                  :options.sync="gridOptions"
                  :items-per-page-options="pageSizes"
                >
                  <template #item.budgetCategoryId="{ item }">
                    <v-icon :color="categoryColor(item.budgetCategoryId)" left>
                      {{ categoryIcon(item.budgetCategoryId) }}
                    </v-icon>
                    {{ categoryName(item.budgetCategoryId) }}
                  </template>

                  <template #item.description="{ item }">
                    <inline-field
                      v-model="item.description"
                      :loading="$wait.is(`saving.transaction.description${item.transactionId}`)"
                      @change="updateTransactionDescription(item)"
                    ></inline-field>
                  </template>

                  <template #item.transactionDate="{ item }">
                    <inline-field
                      v-model="item.transactionDate"
                      type="date"
                      :loading="$wait.is(`saving.transaction.description${item.transactionId}`)"
                      @change="updateTransactionDate(item)"
                    ></inline-field>
                  </template>

                  <template #item.amount="{ item }">
                    <inline-field
                      v-model="item.amount"
                      type="money"
                      :loading="$wait.is(`saving.transaction.amount${item.transactionId}`)"
                      @change="updateTransactionAmount(item)"
                    ></inline-field>
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn color="primary" dark icon text>
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn color="red darken-1" dark icon text>
                      <v-icon @click="deleteTransaction(item.transactionId)">mdi-trash-can</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>

                <!-- <v-list v-if="!$vuetify.breakpoint.smAndUp" dense subheader class="cardBackground">
            <template v-for="(transaction, index) in transactions">
              <v-list-item :key="`i_${transaction.transactionId}_${index}`" class="pb-1">
                <v-list-item-avatar>
                  <v-icon>{{
                    $categoryIcons[getCategoryById(transaction.budgetCategoryId).icon]
                  }}</v-icon>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ transaction.description }}
                    <span class="grey--text text--lighten-1 caption">
                      -
                      {{
                        transaction.transactionDate
                          | dateFormat('EEEE, d.MM.yyyy', $dateLocales[$locale])
                      }}
                    </span>
                  </v-list-item-title>

                  <v-list-item-subtitle class="text--primary">{{
                    transaction.amount | currency($currencyConfig(budget))
                  }}</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action :key="`a1_${transaction.transactionId}_${index}`">
                  <v-transaction-editor
                    :value="transaction"
                    :data-budget="budget"
                    @save="updateTransaction"
                  >
                    <template v-slot:activator="{ on }">
                      <v-icon v-on="on">{{ mdiPencil }}</v-icon>
                    </template>
                  </v-transaction-editor>
                </v-list-item-action>
                <v-list-item-action :key="`a2_${transaction.transactionId}_${index}`">
                  <v-icon @click="deleteTransaction(transaction.transactionId)">{{
                    mdiTrashCan
                  }}</v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list> -->
              </v-card-text>
            </v-card>
          </v-col>
          <v-col :cols="12">
            <v-row justify="end">
              <v-col class="d-flex flex-grow-0" style="min-width: 180px">
                <nobr class="pr-2 white--text">{{ $t('general.itemsPerPage') }}:</nobr>
                <v-select
                  v-model="gridOptions.itemsPerPage"
                  :items="pageSizes"
                  dense
                  solo
                  rounded
                  hide-details
                  style="max-width: 110px"
                ></v-select>
              </v-col>
              <v-col class="d-flex flex-grow-0" style="min-width: 320px">
                <nobr class="pr-2 white--text">{{ $t('general.page') }}:</nobr>
                <v-sheet
                  color="white"
                  class="v-input v-text-field--rounded justify-center py-1 align-center"
                  style="max-width: 100px"
                >
                  <input
                    v-model="pageInput"
                    type="number"
                    class="text-center"
                    :min="1"
                    :max="pages"
                  />
                </v-sheet>

                <v-pagination
                  v-model="gridOptions.page"
                  circle
                  total-visible="0"
                  class="my-0 ml-4"
                  :length="pages"
                ></v-pagination>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format } from 'date-fns';

import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import * as GetTransactionList from '@/typings/api/transactions/GetTransactionList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { TableHeader } from '@/typings/TableHeader';
import { TableOptions } from '@/typings/TableOptions';
import TransactionsApi from '@/api/TransactionsApi';
import { FieldOrderInfo } from '@/typings/api/baseTypes/GridQuery';
import InlineField from '@/components/InlineField.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
    'filter-box': () => import('./components/FilterBox.vue'),
    InlineField,
  },
})
export default class Transactions extends Vue {
  search: string | null = null;
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  query: GetTransactionList.Query = {
    budgetId: this.activeBudget ? this.activeBudget.budgetId : '',
    page: 1,
    pageSize: 10,
    budgetCategoryIds: [],
    budgetCategoryType: null,
    search: '',
    transactionDateStart: null,
    transactionDateEnd: null,
  };

  filtersVisible = true;

  headers: TableHeader<GetTransactionList.TransactionDto>[] = [
    {
      text: this.$t('general.category').toString(),
      sortable: true,
      value: 'budgetCategoryId',
    },
    {
      text: this.$t('general.date').toString(),
      sortable: true,
      value: 'transactionDate',
    },
    {
      text: this.$t('general.description').toString(),
      sortable: true,
      value: 'description',
    },
    {
      text: this.$t('general.amount').toString(),
      sortable: true,
      value: 'amount',
    },
    {
      text: this.$t('general.actions').toString(),
      sortable: false,
      value: 'actions',
    },
  ];

  format = format;
  eBudgetCategoryType = eBudgetCategoryType;
  transactions: GetTransactionList.TransactionDto[] = [];
  totalTransactions = 0;
  gridOptions: TableOptions<GetTransactionList.TransactionDto> = {
    sortBy: ['transactionDate'],
    page: 1,
    itemsPerPage: 20,
    sortDesc: [true],
    groupBy: [],
    groupDesc: [],
    multiSort: true,
    mustSort: false,
  };
  queryTimeout: NodeJS.Timeout | null = null;

  pageSizes = [20, 50, 100, 500];

  get pageInput(): string {
    return this.gridOptions.page.toString();
  }
  set pageInput(value: string) {
    let page = Number(value);
    if (this.gridOptions.page != page) {
      this.gridOptions.page = page;
    }
  }

  get pages() {
    return Math.ceil(this.totalTransactions / this.gridOptions.itemsPerPage);
  }

  get showTransactionsList() {
    return true;
  }

  get isLoading() {
    return this.$wait.is(`loading.transactions`);
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  mounted() {
    if (this.activeBudget) {
      this.fetchTransactions();
    }
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

  async fetchTransactions() {
    if (this.queryTimeout) {
      clearTimeout(this.queryTimeout);
    }
    this.queryTimeout = setTimeout(() => {
      this.executeFetchTransactions();
      this.queryTimeout = null;
    }, 200);
  }

  async executeFetchTransactions() {
    if (!this.activeBudget) {
      return;
    }
    this.$wait.start(`loading.transactions`);
    try {
      const orderColumns = this.gridOptions.sortBy.map((v, index) => {
        const sortDefinition: FieldOrderInfo<GetTransactionList.TransactionDto> = {
          fieldName: v,
          descending: this.gridOptions.sortDesc[index] || true,
        };
        return sortDefinition;
      });

      const data = await TransactionsApi.getTransactionList(
        Object.assign({}, this.query, {
          budgetId: this.activeBudget.budgetId,
          pageSize: this.gridOptions.itemsPerPage,
          page: this.gridOptions.page,
          dataOrder: orderColumns,
        }),
      );
      this.transactions = data.data;
      this.totalTransactions = data.total;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.transactions`);
    }
  }

  async updateTransactionDescription(transaction: GetTransactionList.TransactionDto) {
    this.$wait.start(`saving.transaction.description${transaction.transactionId}`);
    try {
      const result = await TransactionsApi.updateTransactionDescription({
        transactionId: transaction.transactionId,
        description: transaction.description,
      });
      transaction.description = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transaction.description${transaction.transactionId}`);
    }
  }

  async updateTransactionAmount(transaction: GetTransactionList.TransactionDto) {
    this.$wait.start(`saving.transaction.amount${transaction.transactionId}`);
    try {
      const result = await TransactionsApi.updateTransactionAmount({
        transactionId: transaction.transactionId,
        amount: transaction.amount,
      });
      transaction.amount = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transaction.amount${transaction.transactionId}`);
    }
  }

  async updateTransactionDate(transaction: GetTransactionList.TransactionDto) {
    this.$wait.start(`saving.transaction.transactionDate${transaction.transactionId}`);
    try {
      const result = await TransactionsApi.updateTransactionDate({
        transactionId: transaction.transactionId,
        transactionDate: transaction.transactionDate,
      });
      transaction.transactionDate = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transaction.transactionDate${transaction.transactionId}`);
    }
  }

  async removeTransaction(transaction: GetTransactionList.TransactionDto) {
    const confirmed = await this.$msgBox.confirm(
      this.$t('transaction.removeConfirmTitle').toString(),
      this.$t('transaction.removeConfirm').toString(),
    );
    if (!confirmed) {
      return;
    }
    this.$wait.start(`removing.transaction${transaction.transactionId}`);
    try {
      await TransactionsApi.removeTransaction({
        transactionId: transaction.transactionId,
      });
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`removing.transaction.amount${transaction.transactionId}`);
    }
  }
  showFilters() {
    this.filtersVisible = true;
  }
  hideFilters() {
    this.filtersVisible = false;
  }

  @Watch('activeBudget')
  async onBudgetChange() {
    await this.fetchTransactions();
  }

  @Watch('query')
  async onQueryChange() {
    await this.fetchTransactions();
  }

  @Watch('pageSize')
  onPageSizeChange() {
    this.fetchTransactions();
  }

  @Watch('gridOptions', { deep: true })
  onTableOptionsChange() {
    this.fetchTransactions();
  }
}
</script>
