<template>
  <v-dialog v-model="modal" fullscreen>
    <template #activator="{ on }">
      <v-btn color="red" fab right bottom fixed dark v-on="on">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-toolbar dark :color="tabColor">
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
      </v-toolbar>
      <v-card-text v-if="activeBudget" class="pt-3">
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
      <v-card-actions>
        <v-spacer></v-spacer>

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
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import AllocationsApi from '@/api/AllocationsApi';
import TransactionsApi from '@/api/TransactionsApi';
import TransactionEditForm from '@/components/TransactionEditForm.vue';
import AllocationEditForm from '@/components/AllocationEditForm.vue';

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
    AllocationEditForm,
  },
})
export default class MobileNewTransactiopn extends Vue {
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;

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
    console.log('transaction', transaction);
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

  mounted() {
    this.resetForm();
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
