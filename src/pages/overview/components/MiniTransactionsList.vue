<template>
  <v-card class="cardBackground">
    <v-card-title :class="`${color} py-1 mb-0`">
      <div style="width: 100%">
        <v-row no-gutters>
          <v-col class="pa-0 mt-0">
            <span class="subtitle-2 white--text text-sm-left">{{ title }}</span>
          </v-col>

          <v-col class="pa-0 mt-0 d-flex flex-grow-0">
            <expander-button v-model="expanded" small color="white"></expander-button>
          </v-col>
        </v-row>
        <v-row no-gutters style="min-height: 5px">
          <v-progress-linear
            v-show="loading"
            top
            class="pa-0 ma-0"
            color="white"
            height="5"
            buffer-value="0"
            query
            stream
          >
          </v-progress-linear>
        </v-row>
      </div>
    </v-card-title>
    <v-expand-transition>
      <v-card-text v-show="expanded" class="pa-0 ma-0 pb-2">
        <v-list class="py-0 mt-0 cardBackground" dense subheader>
          <v-skeleton-loader
            v-if="loading"
            class="py-3"
            type="list-item-avatar@5"
          ></v-skeleton-loader>

          <template v-else>
            <template v-for="(transactions, date) in itemsByDate">
              <v-list-item-title :key="date" class="my-1 px-3 text-xs-right grey--text caption">{{
                new Date(date) | dateFormat('EEEE, d.MM.yyyy', $i18n.locale)
              }}</v-list-item-title>
              <v-divider :key="date + '_divider'" inset></v-divider>
              <template v-for="transaction in transactions">
                <v-list-item :key="'tr_' + transaction.transactionId" class="pb-1">
                  <v-list-item-action :size="24" style="width: 24px">
                    <inline-field
                      v-model="transaction.budgetCategoryId"
                      type="category"
                      :hide-category-name="true"
                      :category-type="categoryType"
                      :loading="
                        $wait.is(`saving.transaction.budgetCategory${transaction.transactionId}`)
                      "
                      @change="updateTransactionCategory(transaction)"
                    ></inline-field>
                  </v-list-item-action>

                  <v-list-item-content class="py-0">
                    <v-list-item-title class="font-weight-medium">
                      <inline-field
                        v-model="transaction.description"
                        :loading="
                          $wait.is(`saving.transaction.description${transaction.transactionId}`)
                        "
                        @change="updateTransactionDescription(transaction)"
                      ></inline-field>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text--primary">
                      <v-row no-gutters>
                        <v-col>
                          <inline-field
                            v-model="transaction.amount"
                            type="money"
                            :loading="
                              $wait.is(`saving.transaction.amount${transaction.transactionId}`)
                            "
                            @change="updateTransactionAmount(transaction)"
                          ></inline-field>
                        </v-col>
                        <v-col class="text-right">
                          <template v-if="transaction.subTransactions.length > 0">
                            <nobr> ({{ transaction.totalAmount | money }}) </nobr>
                          </template>
                        </v-col>
                      </v-row>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action class="d-flex flex-row">
                    <expander-button
                      small
                      :tooltip="$t('transaction.subtransanctions')"
                      :value="transactionIsExpanded(transaction)"
                      @input="toggleTransactionExpand(transaction, $event)"
                    ></expander-button>
                    <v-menu>
                      <template #activator="{ on }">
                        <icon-button
                          small
                          :tooltip="$t('transaction.changeTransactionDate')"
                          icon="mdi-calendar"
                          :loading="
                            $wait.is(
                              `saving.transaction.transactionDate${transaction.transactionId}`,
                            )
                          "
                          v-on="on"
                        ></icon-button>
                      </template>

                      <date-picker
                        v-model="transaction.transactionDate"
                        @input="updateTransactionDate(transaction)"
                      ></date-picker>
                    </v-menu>
                    <icon-button
                      small
                      :tooltip="$t('transaction.removeTransanction')"
                      icon="mdi-trash-can-outline"
                      :loading="$wait.is(`removing.transaction${transaction.transactionId}`)"
                      @click="removeTransaction(transaction)"
                    ></icon-button>
                  </v-list-item-action>
                </v-list-item>
                <v-expand-transition :key="`st_${transaction.transactionId}`">
                  <div v-show="transactionIsExpanded(transaction)" class="inset-shadow">
                    <v-row :key="`stt_${transaction.transactionId}`" no-gutters>
                      <v-col>
                        <v-subheader>{{
                          $t('trasnsactionHistory.subtransactions.title')
                        }}</v-subheader>
                      </v-col>
                      <v-col class="d-flex flex-grow-0 mt-2">
                        <v-btn
                          color="primary"
                          small
                          text
                          :loading="$wait.is(`saving.subTransaction${transaction.transactionId}`)"
                          @click="createNewSubtransaction(transaction)"
                        >
                          <v-icon left>mdi-plus</v-icon>
                          {{ $t('trasnsactionHistory.subtransactions.new') }}
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row :key="`stl_${transaction.transactionId}`" no-gutters class="mt-0">
                      <v-col class="text-center pa-2 pb-4">
                        <template v-if="transaction.subTransactions.length > 0">
                          <subtransactions-list
                            :items="transaction.subTransactions"
                          ></subtransactions-list>
                        </template>
                        <template v-else>
                          <span>{{ $t('trasnsactionHistory.subtransactions.noData') }}</span>
                        </template>
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </template>
            </template>
          </template>

          <v-list-item v-if="transactions.length == 0 && !loading" class="py-2 justify-center">
            <v-subheader>
              {{ $t('general.noData') }}
            </v-subheader>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="$emit('load-more')">
            <v-list-item-content class="pb-0">
              <v-list-item-title class="text-right" @click="loadMore()">{{
                $t('general.loadMore')
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format } from 'date-fns';
import * as GetTransactionList from '@/typings/api/transactions/GetTransactionList';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import InlineField from '@/components/InlineField.vue';
import ExpanderButton from '@/components/ExpanderButton.vue';
import TransactionsApi from '@/api/TransactionsApi';
import { TransactionNotificationEvents } from '@/plugins/signalr';
import * as AddSubTransaction from '@/typings/api/transactions/AddSubTransaction';
import CreateSubtransactionEditor from '@/modals/CreateSubtransactionEditor.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    InlineField,
    ExpanderButton,
    'date-picker': () => import('@/components/DatePicker.vue'),
    'subtransactions-list': () => import('@/components/SubtransactionsList.vue'),
  },
})
export default class MiniTransactionsList extends Vue {
  @Prop(String) title!: string;
  @Prop(Number) categoryType!: eBudgetCategoryType;

  transactions: GetTransactionList.TransactionDto[] = [];
  pageSize = 10;
  expanded = true;
  expandedTransactions: GetTransactionList.TransactionDto[] = [];

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  get itemsByDate() {
    if (this.transactions) {
      return this.transactions.reduce(
        (acc: any, transaction: GetTransactionList.TransactionDto) => {
          (acc[format(transaction.transactionDate, 'yyyy-MM-dd')] =
            acc[format(transaction.transactionDate, 'yyyy-MM-dd')] || []).push(transaction);
          return acc;
        },
        {},
      );
    }
    return {};
  }

  get loading() {
    return this.$wait.is(`loading.transactions${this.categoryType}`);
  }

  get color(): string {
    return eBudgetCategoryType[this.categoryType].toLowerCase();
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

  toggleTransactionExpand(transaction: GetTransactionList.TransactionDto, value: boolean) {
    if (this.expandedTransactions.includes(transaction) && value == false) {
      this.expandedTransactions.splice(this.expandedTransactions.indexOf(transaction), 1);
    } else if (!this.expandedTransactions.includes(transaction) && value == true) {
      this.expandedTransactions.push(transaction);
    }
  }

  transactionIsExpanded(transaction: GetTransactionList.TransactionDto) {
    return this.expandedTransactions.includes(transaction);
  }

  mounted() {
    this.fetchTransactions();

    this.$notificationHub.on(
      TransactionNotificationEvents.TransactionListChanged,
      this.fetchTransactions,
    );
    this.$notificationHub.on(
      TransactionNotificationEvents.TransactionUpdated,
      this.fetchTransactions,
    );
  }
  beforeDestroy() {
    this.$notificationHub.off(
      TransactionNotificationEvents.TransactionListChanged,
      this.fetchTransactions,
    );
    this.$notificationHub.off(
      TransactionNotificationEvents.TransactionUpdated,
      this.fetchTransactions,
    );
  }

  loadMore() {
    this.pageSize += 5;
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
