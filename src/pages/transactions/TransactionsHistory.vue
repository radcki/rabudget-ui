<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-subheader class="headline">{{ $t('trasnsactionHistory.title') }}</v-subheader>
      </v-flex>

      <v-flex xs12>
        <v-card class="px-3" color="cardBackground">
          <v-card-text>
            <v-container fluid grid-list-sm class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6>
                  <v-container fluid grid-list-sm class="pa-0">
                    <v-layout row wrap>
                      <v-flex xs6>
                        <v-radio-group v-model="categoryType" :mandatory="true" column>
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
                      </v-flex>
                      <v-flex v-if="activeBudget" xs6>
                        <v-category-select
                          v-if="categories"
                          v-model="selectedCategories"
                          multiple
                          :items="categories.filter(v => v.type == categoryType)"
                          persistent-hint
                          :hint="$t('general.category')"
                        ></v-category-select>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-flex>

                <v-flex v-if="activeBudget" xs12 md6>
                  <v-date-range-slider
                    v-model="selectedRange"
                    :min="activeBudget.startingDate"
                    :max="today"
                    step="days"
                  ></v-date-range-slider>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="
                setFilters();
                fetchTransactions();
              "
              >{{ $t('general.search') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex v-if="showTransactionsList || isLoading" xs12>
        <v-subheader class="headline">{{ $t('general.foundData') }}</v-subheader>
      </v-flex>

      <v-flex v-if="isLoading && isMobile" xs12 class="text-xs-center">
        <v-progress-circular
          :size="70"
          :width="7"
          color="amber darken-3"
          indeterminate
        ></v-progress-circular>
      </v-flex>

      <v-card v-if="showTransactionsList" style="width: 100%" class="elevation-1 cardBackground">
        <v-card-text>
          <v-layout row justify-end>
            <v-flex xs4>
              <v-text-field
                v-if="$vuetify.breakpoint.smAndUp"
                v-model="search"
                :append-icon="mdiMagnify"
                :label="$t('general.search')"
                single-line
                hide-details
              ></v-text-field>
            </v-flex>
          </v-layout>

          <v-data-table
            v-if="$vuetify.breakpoint.smAndUp"
            :headers="headers"
            :items="transactions"
            :loading="$wait.is('loading.*')"
            :search="search"
            item-key="transactionId"
            class="cardBackground"
            must-sort
            sort-by
            footer-props.items-per-page-options="[15,25,50,{text: $t('general.all'), value: -1}]"
          >
            <template v-slot:body="{ items }">
              <tbody>
                <tr v-for="item in items" :key="item.transactionId">
                  <td>
                    <v-icon :color="categoryColor(item.budgetCategoryId)" left>
                      {{ categoryIcon(item.budgetCategoryId) }}
                    </v-icon>
                    {{ categoryName(item.budgetCategoryId) }}
                  </td>
                  <td>
                    {{
                      new Date(item.transactionDate) | dateFormat('EEEE, d.MM.yyyy', $i18n.locale)
                    }}
                  </td>
                  <td>{{ item.description }}</td>
                  <td>{{ item.amount | money }}</td>
                  <td>
                    <v-btn color="primary" dark icon text>
                      <v-icon>{{ mdiPencil }}</v-icon>
                    </v-btn>
                    <v-btn color="red darken-1" dark icon text>
                      <v-icon @click="deleteTransaction(item.transactionId)">{{
                        mdiTrashCan
                      }}</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
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
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { subMonths, format } from 'date-fns';

import { mdiMagnify, mdiPencil, mdiTrashCan } from '@mdi/js';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import * as GetTransactionList from '@/typings/api/transactions/GetTransactionList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { TableHeader } from '@/typings/TableHeader';
import TransactionsApi from '@/api/TransactionsApi';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class Transactions extends Vue {
  search: string | null = null;
  categoryType: eBudgetCategoryType = eBudgetCategoryType.Spending;
  selectedRange: any[] = [null, null];
  selectedCategories: string[] = [];
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

  tab = 0;
  requiredRule: any[] = [];

  mdiMagnify = mdiMagnify;
  mdiPencil = mdiPencil;
  mdiTrashCan = mdiTrashCan;
  format = format;
  eBudgetCategoryType = eBudgetCategoryType;
  transactions: GetTransactionList.TransactionDto[] = [];
  pageSize = 10;
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  get today() {
    return new Date();
  }

  get color(): string {
    return eBudgetCategoryType[this.categoryType].toLowerCase();
  }

  get showTransactionsList() {
    return true;
  }

  get monthAgoOrStart() {
    if (!this.activeBudget) {
      return this.today;
    }
    return subMonths(new Date(), 1) < this.activeBudget.startingDate
      ? this.activeBudget.startingDate
      : subMonths(new Date(), 1);
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }
  get isLoading() {
    return this.$wait.is(`loading.transactions${this.categoryType}`);
  }

  created() {
    this.requiredRule = [v => !!v || this.$t('forms.requiredField')];
  }

  mounted() {
    if (this.activeBudget) {
      this.selectedCategories = this.categories.map(v => v.budgetCategoryId);

      this.selectedRange = [this.monthAgoOrStart, this.today];
      this.setFilters();
      this.fetchTransactions();
    }
  }

  setFilters() {
    console.log('setFilters');
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
    if (!this.activeBudget) {
      return;
    }
    this.$wait.start(`loading.transactions${this.categoryType}`);
    try {
      const data = await TransactionsApi.getTransactionList({
        budgetId: this.activeBudget.budgetId,
        budgetCategoryType: this.categoryType,
        page: 1,
        pageSize: this.pageSize,
        dataOrder: [{ fieldName: 'transactionDate', descending: true }],
      });
      this.transactions = data.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.transactions${this.categoryType}`);
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

  @Watch('activeBudget')
  onBudgetChange() {
    this.fetchTransactions();
  }

  @Watch('pageSize')
  onPageSizeChange() {
    this.fetchTransactions();
  }
}
</script>
