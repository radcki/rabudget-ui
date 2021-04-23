<template>
  <v-dialog v-model="modal" transition="slide-y-transition" fullscreen>
    <template #activator="{ on }">
      <v-btn color="red" fab right bottom fixed dark v-on="on">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-app-bar app dark :color="tabColor">
        <v-btn text icon @click="cancel()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-select
          v-model="inputType"
          hide-details
          dense
          :items="inputTypes"
          :return-object="false"
        ></v-select>
        <v-spacer></v-spacer>
        <v-btn
          v-if="inputType == eInputType.Spending"
          text
          :loading="spendingIsSaving"
          @click="createTransaction(newSpending)"
          >{{ $t('newTransaction.createSpending') }}</v-btn
        >
        <v-btn
          v-if="inputType == eInputType.Income"
          :loading="incomeIsSaving"
          text
          @click="createTransaction(newIncome)"
          >{{ $t('newTransaction.createIncome') }}</v-btn
        >
        <v-btn
          v-if="inputType == eInputType.Saving"
          :loading="savingIsSaving"
          text
          @click="createTransaction(newSaving)"
          >{{ $t('newTransaction.createSaving') }}</v-btn
        >
        <v-btn
          v-if="inputType == eInputType.Allocation"
          :loading="allocationIsSaving"
          text
          @click="createAllocation(newAllocation)"
          >{{ $t('newTransaction.createAllocation') }}</v-btn
        >
      </v-app-bar>
      <v-main>
        <v-card-text v-if="activeBudget" class="pt-3">
          <v-row dense>
            <v-col class="text-right">
              <v-menu
                v-if="categoryType"
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
                      templateGroup.category ? templateGroup.category.name : ''
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
                        @load-template="loadTransactionTemplate($copy(transactionTemplate))"
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
          <template v-if="inputType == eInputType.Spending">
            <transaction-edit-form
              key="formSpending"
              v-model="newSpending"
              :category-type="eBudgetCategoryType.Spending"
            ></transaction-edit-form>
          </template>
          <template v-if="inputType == eInputType.Income">
            <transaction-edit-form
              key="formIncome"
              v-model="newIncome"
              :category-type="eBudgetCategoryType.Income"
            ></transaction-edit-form>
          </template>
          <template v-if="inputType == eInputType.Saving">
            <transaction-edit-form
              key="formSaving"
              v-model="newSaving"
              :category-type="eBudgetCategoryType.Saving"
            ></transaction-edit-form>
          </template>
          <template v-if="inputType == eInputType.Allocation">
            <allocation-edit-form
              key="formAllocation"
              v-model="newAllocation"
              :category-type="eBudgetCategoryType.Spending"
            ></allocation-edit-form>
          </template>
        </v-card-text>
      </v-main>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="inputType == eInputType.Spending"
          text
          :loading="templateIsSaving"
          @click="createTransactionTemplate(newSpending)"
          >{{ $t('newTransaction.createTransactionTemplate') }}</v-btn
        >
        <v-btn
          v-if="inputType == eInputType.Income"
          text
          :loading="templateIsSaving"
          @click="createTransactionTemplate(newIncome)"
          >{{ $t('newTransaction.createTransactionTemplate') }}</v-btn
        >
        <v-btn
          v-if="inputType == eInputType.Saving"
          text
          :loading="templateIsSaving"
          @click="createTransactionTemplate(newSaving)"
          >{{ $t('newTransaction.createTransactionTemplate') }}</v-btn
        >
        <v-btn text @click="resetForm">
          {{ $t('general.reset') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import MoneyField from '@/components/MoneyField.vue';
import DateField from '@/components/DateField.vue';
import * as CreateTransaction from '@/typings/api/transactions/CreateTransaction';
import * as CreateAllocation from '@/typings/api/allocations/CreateAllocation';
import * as CreateTransactionTemplate from '@/typings/api/transactionTemplates/CreateTransactionTemplate';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import AllocationsApi from '@/api/AllocationsApi';
import TransactionsApi from '@/api/TransactionsApi';
import TransactionEditForm from '@/components/TransactionEditForm.vue';
import { TransactionTemplateDto } from '@/typings/api/transactionTemplates/GetTransactionTemplateList';
import TransactionTemplatesApi from '@/api/TransactionTemplatesApi';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';

const budgetsStore = namespace('budgets');

enum eInputType {
  Spending = 0,
  Income = 1,
  Saving = 2,
  Allocation = 3,
}

@Component({
  components: {
    DateField,
    MoneyField,
    TransactionEditForm,
    AllocationEditForm: () => import('@/components/AllocationEditForm.vue'),
    TransactionTemplateListItem: () => import('@/components/TransactionTemplateListItem.vue'),
  },
})
export default class MobileNewTransactiopn extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') budgetCategories!: BudgetCategoryDto[];

  color = {
    [eInputType.Spending]: 'spending',
    [eInputType.Income]: 'income',
    [eInputType.Saving]: 'saving',
    [eInputType.Allocation]: 'allocation',
  };
  modal = false;
  inputType: eInputType = eInputType.Spending;
  get inputTypes(): { text: string; value: eInputType }[] {
    return [
      {
        value: eInputType.Spending,
        text: this.$t('general.spending').toString(),
      },
      {
        value: eInputType.Income,
        text: this.$t('general.income').toString(),
      },
      {
        value: eInputType.Saving,
        text: this.$t('general.saving').toString(),
      },
      {
        value: eInputType.Allocation,
        text: this.$t('general.allocation').toString(),
      },
    ];
  }
  eInputType = eInputType;
  eBudgetCategoryType = eBudgetCategoryType;

  newSpending: CreateTransaction.Command = this.generateEmptyTransaction();
  newSaving: CreateTransaction.Command = this.generateEmptyTransaction();
  newIncome: CreateTransaction.Command = this.generateEmptyTransaction();
  newAllocation: CreateAllocation.Command = this.generateEmptyAllocation();

  transactionTemplates: TransactionTemplateDto[] = [];
  transactionTemplatesMenu = false;

  get categoryType(): eBudgetCategoryType | null {
    switch (this.inputType) {
      case eInputType.Spending:
        return eBudgetCategoryType.Spending;
      case eInputType.Saving:
        return eBudgetCategoryType.Saving;
      case eInputType.Income:
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

  get tabColor() {
    return this.color[this.inputType];
  }

  get spendingIsSaving() {
    return this.$wait.is(`saving.transection_${eInputType.Spending}`);
  }
  get incomeIsSaving() {
    return this.$wait.is(`saving.transection_${eInputType.Income}`);
  }
  get savingIsSaving() {
    return this.$wait.is(`saving.transection_${eInputType.Saving}`);
  }
  get allocationIsSaving() {
    return this.$wait.is(`saving.allocation_${eInputType.Allocation}`);
  }
  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  get templatesAreLoading() {
    return this.$wait.is(`loading.transactionTemplates`);
  }

  get templateIsSaving() {
    return this.$wait.is(`saving.transectionTemplate`);
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

  async createTransaction(transaction: CreateTransaction.Command) {
    const inputType = this.inputType;
    this.$wait.start(`saving.transection_${inputType}`);
    const type = this.inputType;
    try {
      await TransactionsApi.createTransaction(transaction);
      this.$emit('transactionCreated');
      switch (type) {
        case eInputType.Spending:
          this.$emit('spending-created');
          break;
        case eInputType.Income:
          this.$emit('income-created');
          break;
        case eInputType.Saving:
          this.$emit('saving-created');
          break;
      }
      transaction = Object.assign(transaction, this.generateEmptyTransaction());
      this.modal = false;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transection_${inputType}`);
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
    this.$wait.start(`saving.allocation`);
    try {
      await AllocationsApi.createAllocation(allocation);
      this.$emit('allocationCreated');

      allocation = Object.assign(allocation, this.generateEmptyAllocation());
      this.modal = false;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation`);
    }
  }

  resetForm() {
    this.newSpending = Object.assign({}, this.generateEmptyTransaction());
    this.newIncome = Object.assign({}, this.generateEmptyTransaction());
    this.newSaving = Object.assign({}, this.generateEmptyTransaction());
    this.newAllocation = Object.assign({}, this.generateEmptyAllocation());
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

  cancel() {
    this.modal = false;
  }

  created() {
    this.$root.$on('closeDialogs', this.cancel);
  }

  beforeDestroy() {
    this.$root.$off('closeDialogs', this.cancel);
  }

  @Watch('isMobile')
  onMediaTypechange(isMobile) {
    if (!isMobile) {
      this.cancel();
    }
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

  @Watch('modal')
  onOpenClose(isOpen) {
    this.resetForm();
    if (!isOpen) {
      this.cancel();
      this.$wait.end('dialog');
    } else {
      this.$wait.start('dialog');
    }
  }
}
</script>
