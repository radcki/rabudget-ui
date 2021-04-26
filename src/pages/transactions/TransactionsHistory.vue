<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{
          $t('trasnsactionHistory.title')
        }}</v-subheader>
      </v-col>
      <v-col v-if="!isMobile" cols="4" class="pt-4">
        <v-text-field
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
    <v-row class="mt-1">
      <v-col v-if="filtersVisible" :class="!isMobile ? 'd-flex flex-grow-0' : ''">
        <v-row no-gutters>
          <v-col :cols="12">
            <filter-box v-model="query"></filter-box>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <v-col v-if="isMobile" cols="12" class="pt-4">
            <v-text-field
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
                  show-expand
                  hide-default-footer
                  :server-items-length="totalTransactions"
                  :options.sync="gridOptions"
                  :items-per-page-options="pageSizes"
                >
                  <template #item.budgetCategoryId="{ item }">
                    <inline-field
                      v-model="item.budgetCategoryId"
                      type="category"
                      :category-type="categoryType(item.budgetCategoryId)"
                      :loading="$wait.is(`saving.transaction.budgetCategory${item.transactionId}`)"
                      @change="updateTransactionCategory(item)"
                    ></inline-field>
                  </template>

                  <template #item.description="{ item }">
                    <inline-field
                      v-model="item.description"
                      :loading="$wait.is(`saving.transaction.description${item.transactionId}`)"
                      @change="updateTransactionDescription(item)"
                    ></inline-field>
                  </template>

                  <template #item.transactionDate="{ item }">
                    <nobr>
                      <inline-field
                        v-model="item.transactionDate"
                        type="date"
                        :loading="
                          $wait.is(`saving.transaction.transactionDate${item.transactionId}`)
                        "
                        @change="updateTransactionDate(item)"
                      ></inline-field>
                    </nobr>
                  </template>

                  <template #item.amount="{ item }">
                    <nobr>
                      <inline-field
                        v-model="item.amount"
                        type="money"
                        :loading="$wait.is(`saving.transaction.amount${item.transactionId}`)"
                        @change="updateTransactionAmount(item)"
                      ></inline-field>
                    </nobr>
                    <template v-if="item.subTransactions.length > 0">
                      <nobr> ({{ item.totalAmount | money }}) </nobr>
                    </template>
                  </template>

                  <template #item.actions="{ item }">
                    <v-row no-gutters>
                      <v-col>
                        <icon-button
                          :tooltip="$t('transaction.removeTransanction')"
                          icon="mdi-trash-can"
                          color="red"
                          :loading="$wait.is(`removing.transaction${item.transactionId}`)"
                          @click="removeTransaction(item)"
                        ></icon-button>
                      </v-col>
                      <v-col>
                        <icon-button
                          :tooltip="$t('transaction.createTemplateFromTransaction')"
                          icon="mdi-content-save-outline"
                          color="blue"
                          :loading="$wait.is(`saving.transactionTemplate${item.transactionId}`)"
                          @click="createTransactionTemplate(item)"
                        ></icon-button>
                      </v-col>
                    </v-row>
                  </template>

                  <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length" class="py-2">
                      <v-row no-gutters>
                        <v-col>
                          <v-subheader>{{
                            $t('trasnsactionHistory.subtransactions.title')
                          }}</v-subheader>
                        </v-col>
                        <v-col class="d-flex flex-grow-0 mt-2">
                          <v-btn
                            color="primary"
                            small
                            :loading="$wait.is(`saving.subTransaction${item.transactionId}`)"
                            @click="createNewSubtransaction(item)"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            {{ $t('trasnsactionHistory.subtransactions.new') }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row no-gutters class="mt-0">
                        <v-col class="text-center pb-2">
                          <template v-if="item.subTransactions.length > 0">
                            <subtransactions-list
                              :items="item.subTransactions"
                            ></subtransactions-list>
                          </template>
                          <template v-else>
                            <span>{{ $t('trasnsactionHistory.subtransactions.noData') }}</span>
                          </template>
                        </v-col>
                      </v-row>
                    </td>
                  </template>
                </v-data-table>

                <v-list v-if="isMobile" dense subheader>
                  <template v-for="(item, index) in transactions">
                    <v-list-item :key="`i_${item.transactionId}_${index}`" class="px-0 py-0">
                      <v-list-item-avatar class="my-0">
                        <inline-field
                          v-model="item.budgetCategoryId"
                          type="category"
                          hide-category-name
                          :category-type="categoryType(item.budgetCategoryId)"
                          :loading="
                            $wait.is(`saving.transaction.budgetCategory${item.transactionId}`)
                          "
                          @change="updateTransactionCategory(item)"
                        ></inline-field>
                      </v-list-item-avatar>

                      <v-list-item-content class="py-1">
                        <v-list-item-title class="font-weight-medium">
                          <inline-field
                            v-model="item.description"
                            :loading="
                              $wait.is(`saving.transaction.description${item.transactionId}`)
                            "
                            @change="updatTransactionDescription(item)"
                          ></inline-field>
                        </v-list-item-title>

                        <v-list-item-subtitle class="text--primary">
                          <v-row no-gutters>
                            <v-col>
                              <inline-field
                                v-model="item.amount"
                                type="money"
                                :loading="
                                  $wait.is(`saving.transaction.amount${item.transactionId}`)
                                "
                                @change="updateTransactionAmount(item)"
                              ></inline-field>
                            </v-col>
                            <v-col style="padding-top: 2px">
                              <template v-if="item.subTransactions.length > 0">
                                <nobr> ({{ item.totalAmount | money }}) </nobr>
                              </template>
                            </v-col>
                            <v-col>
                              <inline-field
                                v-model="item.transactionDate"
                                type="date"
                                :loading="
                                  $wait.is(
                                    `saving.transaction.transactionDate${item.transactionId}`,
                                  )
                                "
                                @change="updateSubTransactionDate(item)"
                              ></inline-field>
                            </v-col>
                          </v-row>
                        </v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action :key="`a1_${item.transactionId}_${index}`" class="my-0">
                        <icon-button
                          :tooltip="$t('transaction.removeTransanction')"
                          icon="mdi-trash-can"
                          color="red"
                          :loading="$wait.is(`removing.subTransaction${item.transactionId}`)"
                          @click="removeTransaction(item)"
                        ></icon-button>
                      </v-list-item-action>
                      <v-list-item-action
                        :key="`a2_${item.transactionId}_${index}`"
                        class="my-0 mx-0"
                      >
                        <icon-button
                          :icon="
                            subTransactionsVisible(item) ? 'mdi-chevron-up' : 'mdi-chevron-down'
                          "
                          @click="toggleShowSubTransactions(item)"
                        ></icon-button>
                      </v-list-item-action>
                    </v-list-item>
                    <v-list v-if="subTransactionsVisible(item)" :key="`sbt_${index}`">
                      <v-row no-gutters>
                        <v-col>
                          <v-subheader>{{
                            $t('trasnsactionHistory.subtransactions.title')
                          }}</v-subheader>
                        </v-col>
                        <v-col class="d-flex flex-grow-0 mt-2">
                          <v-btn
                            color="primary"
                            small
                            :loading="$wait.is(`saving.subTransaction${item.transactionId}`)"
                            @click="createNewSubtransaction(item)"
                          >
                            <v-icon left>mdi-plus</v-icon>
                            {{ $t('trasnsactionHistory.subtransactions.new') }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <template v-if="item.subTransactions.length > 0">
                        <subtransactions-list :items="item.subTransactions"></subtransactions-list>
                      </template>
                    </v-list>
                    <v-divider
                      v-if="index < transactions.length - 1"
                      :key="`dv_${index}`"
                    ></v-divider>
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col :cols="12">
            <v-row justify="end">
              <v-col class="mr-2 d-flex flex-grow-0" style="min-width: 180px">
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
              <v-col class="d-flex flex-grow-0 justify-end" style="min-width: 320px">
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
import * as AddSubTransaction from '@/typings/api/transactions/AddSubTransaction';
import CreateSubtransactionEditor from '@/modals/CreateSubtransactionEditor.vue';
import TransactionTemplatesApi from '@/api/TransactionTemplatesApi';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'filter-box': () => import('./components/FilterBox.vue'),
    'subtransactions-list': () => import('@/components/SubtransactionsList.vue'),
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
    { text: '', value: 'data-table-expand' },
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

  expandedTransactionIds: string[] = [];

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

  categoryType(budgetCategoryId): eBudgetCategoryType {
    const categoryType = this.categories.find(v => v.budgetCategoryId == budgetCategoryId)
      ?.budgetCategoryType;

    return categoryType;
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

  async updateTransactionCategory(transaction: GetTransactionList.TransactionDto) {
    this.$wait.start(`saving.transaction.budgetCategory${transaction.transactionId}`);
    try {
      const result = await TransactionsApi.updateTransactionCategory({
        transactionId: transaction.transactionId,
        budgetCategoryId: transaction.budgetCategoryId,
      });
      transaction.budgetCategoryId = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transaction.budgetCategory${transaction.transactionId}`);
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
      this.fetchTransactions();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`removing.transaction${transaction.transactionId}`);
    }
  }

  async createNewSubtransaction(transaction: GetTransactionList.TransactionDto) {
    let command: AddSubTransaction.Command = {
      transactionId: transaction.transactionId,
      amount: {
        currencyCode: transaction.amount.currencyCode,
        amount: 0,
        display: '',
      },
      description: '',
      transactionDate: new Date(),
    };

    command = await this.$modal.open(CreateSubtransactionEditor, command, {
      title: this.$t('transactionHistory.subtransactions.editorTitle').toString(),
    });

    if (!command) {
      return;
    }
    this.$wait.start(`saving.subTransaction${transaction.transactionId}`);
    try {
      await TransactionsApi.addSubTransaction(command);
      this.fetchTransactions();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.subTransaction${transaction.transactionId}`);
    }
  }

  async createTransactionTemplate(transaction: GetTransactionList.TransactionDto) {
    this.$wait.start(`saving.transectionTemplate${transaction.transactionId}`);
    try {
      await TransactionTemplatesApi.createTransactionTemplate({
        budgetCategoryId: transaction.budgetCategoryId,
        amount: transaction.amount,
        description: transaction.description,
      });
      this.$msgBox.success(
        this.$t('general.success').toString(),
        this.$t('transaction.transactionTemplateCreated').toString(),
      );
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transectionTemplate${transaction.transactionId}`);
    }
  }

  subTransactionsVisible(transaction: GetTransactionList.TransactionDto) {
    return this.expandedTransactionIds.includes(transaction.transactionId);
  }
  toggleShowSubTransactions(transaction: GetTransactionList.TransactionDto) {
    if (this.subTransactionsVisible(transaction)) {
      this.expandedTransactionIds.splice(
        this.expandedTransactionIds.indexOf(transaction.transactionId),
        1,
      );
    } else {
      this.expandedTransactionIds.push(transaction.transactionId);
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
