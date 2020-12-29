<template>
  <div>
    <v-row no-gutters>
      <v-col>
        <v-btn text color="primary" @click="createBudget()">
          <v-icon left>mdi-plus</v-icon>
          {{ $t('budgetsManager.newBudget') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col :cols="12">
        <v-data-table
          v-model="activeBudgetId"
          :headers="headers"
          :items="budgets"
          show-select
          single-select
          item-key="budgetId"
          disable-filtering
          disable-pagination
          hide-default-footer
        >
          <template #item.name="{ item }">
            <inline-field
              v-model="item.name"
              :loading="$wait.is(`saving.budget.name${item.budgetId}`)"
              @change="updateBudgetName(item)"
            ></inline-field>
          </template>
          <template #item.startingDate="{ item }">
            <inline-field
              v-model="item.startingDate"
              type="date"
              :loading="$wait.is(`saving.budget.startingDate${item.budgetId}`)"
              @change="updateBudgetStartingDate(item)"
            ></inline-field>
          </template>
          <template #item.currency="{ item }">
            {{ item.currency.symbol }} - {{ item.currency.nativeName }}
          </template>
          <template #item.actions="{ item }">
            <icon-button
              icon="mdi-delete"
              small
              :tooltip="$t('general.remove')"
              :loading="$wait.is(`deleting.budget${item.budgetId}`)"
              @click="deleteBudget(item)"
            ></icon-button>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import { TableHeader } from '@/typings/TableHeader';
import { BudgetState } from '@/store/budget.module';
import BudgetApi from '@/api/BudgetApi';

const budgetsStore = namespace('budgets');

@Component
export default class BudgetsManager extends Vue {
  @Inject('setPayload') setPayload?: any;
  @Inject('payload') payload?: any;
  @Inject('cancel') cancel?: () => void;

  @budgetsStore.State((state: BudgetState) => state.budgets) budgets!: Budget[];
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;
  @budgetsStore.Mutation('setActive') setActiveBudgetId!: (budget: Budget) => void;
  @budgetsStore.Action('loadBudgets') loadBudgets!: () => Promise<void>;

  get activeBudgetId() {
    return [this.activeBudget];
  }
  set activeBudgetId(value: Budget[]) {
    if (value.length > 0) {
      this.setActiveBudgetId(value[0]);
      return;
    }
    this.setActiveBudgetId(null);
  }

  headers: TableHeader<Budget>[] = [
    {
      value: 'name',
      text: this.$t('budgetsManager.name').toString(),
    },
    {
      value: 'startingDate',
      text: this.$t('budgetsManager.startingDate').toString(),
    },
    {
      value: 'currency',
      text: this.$t('budgetsManager.currency').toString(),
    },
    {
      value: 'actions',
      text: '',
      sortable: false,
      width: 200,
    },
  ];

  async deleteBudget(budget: Budget) {
    const confirmed = await this.$msgBox.confirm(
      this.$t('budgetsManager.deleteBudget.title').toString(),
      this.$t('budgetsManager.deleteBudget.message', { budgetName: budget.name }).toString(),
    );
    if (!confirmed) {
      return;
    }
    this.$wait.start(`deleting.budget${budget.budgetId}`);
    try {
      await BudgetApi.removeBudget({ budgetId: budget.budgetId });
      this.loadBudgets();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`deleting.budget${budget.budgetId}`);
    }
  }

  async updateBudgetName(budget: Budget) {
    this.$wait.start(`saving.budget.name${budget.budgetId}`);
    try {
      await BudgetApi.updateBudgetName({ budgetId: budget.budgetId, name: budget.name });
      this.loadBudgets();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.budget.name${budget.budgetId}`);
    }
  }
  async updateBudgetStartingDate(budget: Budget) {
    this.$wait.start(`saving.budget.startingDate${budget.budgetId}`);
    try {
      await BudgetApi.updateBudgetStartingDate({
        budgetId: budget.budgetId,
        startingDate: budget.startingDate,
      });
      this.loadBudgets();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.budget.startingDate${budget.budgetId}`);
    }
  }

  createBudget() {
    if (this.$route.name != 'newBudget') {
      this.$router.push({ name: 'newBudget' });
    }
    this.cancel();
  }
}
</script>
