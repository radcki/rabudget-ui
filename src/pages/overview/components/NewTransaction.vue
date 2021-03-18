<template>
  <v-card>
    <v-card-title :class="`pa-1 pb-0 ${tabColor}`">
      <v-tabs slot="extension" v-model="tab" show-arrows :background-color="tabColor" grow>
        <v-tabs-slider></v-tabs-slider>
        <v-tab class="subheading white--text" ripple>{{ $t('general.spending') }}</v-tab>
        <v-tab class="subheading white--text" ripple>{{ $t('general.income') }}</v-tab>
        <v-tab class="subheading white--text" ripple>{{ $t('general.saving') }}</v-tab>
        <v-tab class="subheading white--text" ripple>{{ $t('general.allocation') }}</v-tab>
      </v-tabs>
    </v-card-title>
    <v-card-text v-if="activeBudget" class="pt-3">
      <v-row dense>
        <v-col class="text-right">
          <v-menu
            v-model="transactionTemplatesMenu"
            min-width="300"
            offset-y
            :close-on-content-click="false"
          >
            <template #activator="{ on }">
              <v-btn text :loading="templatesAreLoading" v-on="on">
                {{ $t('transaction.transactionTemplates') }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <template v-for="(templateGroup, templateGroupIndex) in groupedTemplates">
                <v-subheader :key="`tg_${templateGroupIndex}`">{{
                  templateGroup.category.name
                }}</v-subheader>
                <template
                  v-for="(
                    transactionTemplate, transactionTemaplateIndex
                  ) in templateGroup.templates"
                >
                  <transaction-template-list-item
                    :key="`tt_${templateGroupIndex}_${transactionTemaplateIndex}`"
                    :value="transactionTemplate"
                    :category-type="categoryType"
                    @removed="fetchTransactionTemplates()"
                    @load-template="loadTransactionTemplate(transactionTemplate)"
                  >
                  </transaction-template-list-item>
                </template>
              </template>

              <template v-if="transactionTemplates.length == 0">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ $t('transaction.noTemplates') }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>

      <template v-if="tab == eTab.Spending">
        <transaction-edit-form
          key="formSpending"
          v-model="newSpending"
          :category-type="eBudgetCategoryType.Spending"
        ></transaction-edit-form>
      </template>
      <template v-if="tab == eTab.Income">
        <transaction-edit-form
          key="formIncome"
          v-model="newIncome"
          :category-type="eBudgetCategoryType.Income"
        ></transaction-edit-form>
      </template>
      <template v-if="tab == eTab.Saving">
        <transaction-edit-form
          key="formSaving"
          v-model="newSaving"
          :category-type="eBudgetCategoryType.Saving"
        ></transaction-edit-form>
      </template>
      <template v-if="tab == eTab.Allocation">
        <allocation-edit-form
          key="formAllocation"
          v-model="newAllocation"
          :category-type="eBudgetCategoryType.Spending"
        ></allocation-edit-form>
      </template>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        v-if="tab == eTab.Spending"
        text
        :loading="spendingIsSaving"
        @click="createTransactionTemplate(newSpending)"
        >{{ $t('newTransaction.createTransactionTemplate') }}</v-btn
      >
      <v-btn
        v-if="tab == eTab.Income"
        text
        :loading="spendingIsSaving"
        @click="createTransactionTemplate(newIncome)"
        >{{ $t('newTransaction.createTransactionTemplate') }}</v-btn
      >
      <v-btn
        v-if="tab == eTab.Saving"
        text
        :loading="spendingIsSaving"
        @click="createTransactionTemplate(newSaving)"
        >{{ $t('newTransaction.createTransactionTemplate') }}</v-btn
      >

      <v-btn
        v-if="tab == eTab.Spending"
        text
        :loading="spendingIsSaving"
        color="spending"
        @click="createTransaction(newSpending)"
        >{{ $t('newTransaction.createSpending') }}</v-btn
      >
      <v-btn
        v-if="tab == eTab.Income"
        :loading="incomeIsSaving"
        text
        color="income"
        @click="createTransaction(newIncome)"
        >{{ $t('newTransaction.createIncome') }}</v-btn
      >
      <v-btn
        v-if="tab == eTab.Saving"
        :loading="savingIsSaving"
        text
        color="saving"
        @click="createTransaction(newSaving)"
        >{{ $t('newTransaction.createSaving') }}</v-btn
      >
      <v-btn
        v-if="tab == eTab.Allocation"
        :loading="allocationIsSaving"
        text
        color="saving"
        @click="createAllocation(newAllocation)"
        >{{ $t('newTransaction.createAllocation') }}</v-btn
      >
      <v-btn text @click="resetForm">
        {{ $t('general.reset') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import TransactionEditForm from '@/components/TransactionEditForm.vue';
import * as CreateTransaction from '@/typings/api/transactions/CreateTransaction';
import * as CreateTransactionTemplate from '@/typings/api/transactionTemplates/CreateTransactionTemplate';
import * as CreateAllocation from '@/typings/api/allocations/CreateAllocation';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import TransactionsApi from '@/api/TransactionsApi';
import AllocationsApi from '@/api/AllocationsApi';
import TransactionTemplatesApi from '@/api/TransactionTemplatesApi';
import { TransactionTemplateDto } from '@/typings/api/transactionTemplates/GetTransactionTemplateList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';

const budgetsStore = namespace('budgets');

enum eTab {
  Spending = 0,
  Income = 1,
  Saving = 2,
  Allocation = 3,
}

@Component({
  components: {
    TransactionEditForm,
    AllocationEditForm: () => import('@/components/AllocationEditForm.vue'),
    TransactionTemplateListItem: () => import('@/components/TransactionTemplateListItem.vue'),
  },
})
export default class NewTransaction extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') budgetCategories!: BudgetCategoryDto[];

  color = {
    [eTab.Spending]: 'spending',
    [eTab.Income]: 'income',
    [eTab.Saving]: 'saving',
    [eTab.Allocation]: 'allocation',
  };

  tab: eTab = eTab.Spending;
  eTab = eTab;
  eBudgetCategoryType = eBudgetCategoryType;

  newSpending: CreateTransaction.Command = this.generateEmptyTransaction();
  newSaving: CreateTransaction.Command = this.generateEmptyTransaction();
  newIncome: CreateTransaction.Command = this.generateEmptyTransaction();
  newAllocation: CreateAllocation.Command = this.generateEmptyAllocation();

  transactionTemplates: TransactionTemplateDto[] = [];
  transactionTemplatesMenu = false;

  get tabColor() {
    return this.color[this.tab];
  }

  get categoryType(): eBudgetCategoryType | null {
    switch (this.tab) {
      case eTab.Spending:
        return eBudgetCategoryType.Spending;
      case eTab.Saving:
        return eBudgetCategoryType.Saving;
      case eTab.Income:
        return eBudgetCategoryType.Income;
      default:
        return null;
    }
  }

  get groupedTemplates() {
    return [...new Set(this.transactionTemplates.map(v => v.budgetCategoryId))].map(v => {
      const category = this.budgetCategories.find(c => c.budgetCategoryId == v);
      return {
        category,
        templates: this.transactionTemplates.filter(t => t.budgetCategoryId == v),
      };
    });
  }

  get spendingIsSaving() {
    return this.$wait.is(`saving.transection_${eTab.Spending}`);
  }
  get incomeIsSaving() {
    return this.$wait.is(`saving.transection_${eTab.Income}`);
  }
  get savingIsSaving() {
    return this.$wait.is(`saving.transection_${eTab.Saving}`);
  }
  get allocationIsSaving() {
    return this.$wait.is(`saving.allocation_${eTab.Allocation}`);
  }

  get templatesAreLoading() {
    return this.$wait.is(`loading.transactionTemplates`);
  }

  generateEmptyTransaction() {
    return {
      budgetCategoryId: '',
      amount: {
        currencyCode: this.activeBudget ? this.activeBudget.currency.currencyCode : 0,
        amount: 0,
      },
      description: '',
      transactionDate: new Date(),
    };
  }

  generateEmptyAllocation() {
    return {
      sourceBudgetCategoryId: '',
      targetBudgetCategoryId: '',
      amount: {
        currencyCode: this.activeBudget ? this.activeBudget.currency.currencyCode : 0,
        amount: 0,
      },
      description: '',
      allocationDate: new Date(),
    };
  }

  resetForm() {
    this.newSpending = Object.assign({}, this.generateEmptyTransaction());
    this.newIncome = Object.assign({}, this.generateEmptyTransaction());
    this.newSaving = Object.assign({}, this.generateEmptyTransaction());
    this.newAllocation = Object.assign({}, this.generateEmptyAllocation());
  }

  async createTransaction(transaction: CreateTransaction.Command) {
    this.$wait.start(`saving.transection_${this.tab}`);
    const type = this.tab;
    try {
      await TransactionsApi.createTransaction(transaction);
      this.$emit('transactionCreated');
      switch (type) {
        case eTab.Spending:
          this.$emit('spending-created');
          break;
        case eTab.Income:
          this.$emit('income-created');
          break;
        case eTab.Saving:
          this.$emit('saving-created');
          break;
      }
      transaction = Object.assign(transaction, this.generateEmptyTransaction());
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transection_${this.tab}`);
    }
  }

  async createTransactionTemplate(transactionTemplate: CreateTransactionTemplate.Command) {
    this.$wait.start(`saving.transectionTemplate`);
    try {
      await TransactionTemplatesApi.createTransactionTemplate(transactionTemplate);
      this.$emit('transactionTemplateCreated');

      transactionTemplate = Object.assign(transactionTemplate, this.generateEmptyTransaction());
      this.fetchTransactionTemplates();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transectionTemplate`);
    }
  }

  async createAllocation(allocation: CreateAllocation.Command) {
    this.$wait.start(`saving.allocation_${this.tab}`);
    const type = this.tab;
    try {
      await AllocationsApi.createAllocation(allocation);
      this.$emit('allocationCreated');
      switch (type) {
        case eTab.Spending:
          this.$emit('spending-created');
          break;
        case eTab.Income:
          this.$emit('income-created');
          break;
        case eTab.Saving:
          this.$emit('saving-created');
          break;
      }
      allocation = Object.assign(allocation, this.generateEmptyAllocation());
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation_${this.tab}`);
    }
  }

  async fetchTransactionTemplates() {
    if (!this.activeBudget || !this.categoryType) {
      this.transactionTemplates = [];
      return;
    }
    this.$wait.start(`loading.transactionTemplates`);
    try {
      const categoryType = this.categoryType;
      const data = await TransactionTemplatesApi.getTransactionTemplateList({
        budgetId: this.activeBudget.budgetId,
        budgetCategoryType: categoryType,
      });
      if (categoryType == this.categoryType) {
        this.transactionTemplates = data.data;
      }
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.transactionTemplates`);
    }
  }

  loadTransactionTemplate(transactionTemplate: TransactionTemplateDto) {
    switch (this.categoryType) {
      case eBudgetCategoryType.Spending:
        this.newSpending.amount = transactionTemplate.amount;
        this.newSpending.description = transactionTemplate.description;
        this.newSpending.budgetCategoryId = transactionTemplate.budgetCategoryId;
        break;
      case eBudgetCategoryType.Income:
        this.newIncome.amount = transactionTemplate.amount;
        this.newIncome.description = transactionTemplate.description;
        this.newIncome.budgetCategoryId = transactionTemplate.budgetCategoryId;
        break;
      case eBudgetCategoryType.Saving:
        this.newSaving.amount = transactionTemplate.amount;
        this.newSaving.description = transactionTemplate.description;
        this.newSaving.budgetCategoryId = transactionTemplate.budgetCategoryId;
        break;
    }

    this.transactionTemplatesMenu = false;
  }

  mounted() {
    this.resetForm();
    this.fetchTransactionTemplates();
  }

  @Watch('activeBudget', { deep: true })
  onBudgetChange() {
    this.resetForm();
    this.fetchTransactionTemplates();
  }

  @Watch('categoryType')
  onCategoryTypeChange() {
    this.fetchTransactionTemplates();
  }
}
</script>
