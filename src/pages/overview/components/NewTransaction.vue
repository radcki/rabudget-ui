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
import AllocationEditForm from '@/components/AllocationEditForm.vue';
import * as CreateTransaction from '@/typings/api/transactions/CreateTransaction';
import * as CreateAllocation from '@/typings/api/allocations/CreateAllocation';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import TransactionsApi from '@/api/TransactionsApi';
import AllocationsApi from '@/api/AllocationsApi';

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
    AllocationEditForm,
  },
})
export default class NewTransaction extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;

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

  get tabColor() {
    return this.color[this.tab];
  }

  get spendingIsSaving() {
    return this.$wait.start(`saving.transection_${eTab.Spending}`);
  }
  get incomeIsSaving() {
    return this.$wait.start(`saving.transection_${eTab.Income}`);
  }
  get savingIsSaving() {
    return this.$wait.start(`saving.transection_${eTab.Saving}`);
  }
  get allocationIsSaving() {
    return this.$wait.start(`saving.allocation_${eTab.Allocation}`);
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
    console.log('transaction', transaction);
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

  mounted() {
    this.resetForm();
  }

  @Watch('activeBudget', { deep: true })
  onBudgetChange() {
    this.resetForm();
  }
}
</script>
