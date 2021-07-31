<template>
  <div>
    <v-form>
      <v-row>
        <v-col class="d-flex flex-grow-0">
          <category-icon-select
            v-model="budgetCategory.budgetCategoryIconId"
            filled
            style="width: 80px !important"
          ></category-icon-select>
        </v-col>
        <v-col>
          <v-text-field
            v-model="budgetCategory.name"
            filled
            :label="$t('budgetCategories.name')"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col class="py-0 my-0">
          {{ $t('budgetCategories.budgetedAmounts') }}
        </v-col>
        <v-col class="d-flex flex-grow-0 px-3 py-0 my-0">
          <v-btn color="primary" @click="addBudgetedAmount()">
            <v-icon left>mdi-plus</v-icon>
            {{ $t('general.add') }}
          </v-btn>
        </v-col>
      </v-row>
      <template v-for="(budgetedAmount, i) in budgetCategory.budgetedAmounts">
        <v-row :key="`ba_${i}`" dense>
          <v-col>
            <date-field
              v-model="budgetedAmount.validFrom"
              filled
              :label="$t('budgetCategories.validFrom')"
              type="month"
            ></date-field>
          </v-col>
          <v-col>
            <money-field
              v-model="budgetedAmount.amount"
              filled
              :label="$t('budgetCategories.budgetedAmount')"
            ></money-field>
          </v-col>
          <v-col>
            <div>
              {{ $t('budgetCategories.dailyAmount') }}:
              {{ calculateDaily(budgetedAmount.amount) | money }}
            </div>
            <div>
              {{ $t('budgetCategories.yearlyAmount') }}:
              {{ calculateYearly(budgetedAmount.amount) | money }}
            </div>
          </v-col>
          <v-col class="d-flex flex-grow-0 mx-3 align-center">
            <icon-button
              v-if="showRemoveBudgetedAmountIcon"
              icon="mdi-close"
              color="red"
              :tooltip="$t('general.remove')"
              @click="removeBudgetedAmount(budgetedAmount)"
            ></icon-button>
          </v-col>
        </v-row>
      </template>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import {
  BudgetCategoryDto,
  BudgetedAmountDto,
} from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { MoneyAmount } from '@/typings/MoneyAmount';
import MoneyField from '@/components/MoneyField.vue';
import DateField from '@/components/DateField.vue';
import CategoryIconSelect from '@/components/CategoryIconSelect.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    CategoryIconSelect,
    DateField,
    MoneyField,
  },
})
export default class BudgetCategoryEditor extends Vue {
  @Inject('setPayload') setPayload!: any;
  @Inject('payload') payload!: BudgetCategoryDto;

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;

  budgetCategory: BudgetCategoryDto = Object.assign({}, this.payload);

  mounted() {
    this.budgetCategory = Object.assign({}, this.payload);
  }

  @Watch('budgetCategory', { deep: true })
  onInput() {
    this.setPayload(this.budgetCategory);
  }

  get showRemoveBudgetedAmountIcon() {
    return this.budgetCategory.budgetedAmounts.length > 1;
  }

  calculateYearly(amount: MoneyAmount): MoneyAmount {
    return {
      currencyCode: amount.currencyCode,
      amount: amount.amount * 12,
    };
  }

  calculateDaily(amount: MoneyAmount): MoneyAmount {
    return {
      currencyCode: amount.currencyCode,
      amount: (amount.amount * 12) / 365,
    };
  }

  removeBudgetedAmount(budgetedAmount: BudgetedAmountDto) {
    if (!budgetedAmount.budgetedAmountId) {
      this.budgetCategory.budgetedAmounts.splice(
        this.budgetCategory.budgetedAmounts.indexOf(budgetedAmount),
        1,
      );
    } else {
      //todo
    }
  }

  addBudgetedAmount() {
    const newAmount: BudgetedAmountDto = {
      budgetedAmountId: '',
      validFrom: new Date(),
      validTo: null,
      amount: {
        currencyCode: this.activeBudget.currency.currencyCode,
        amount: 0,
      },
    };
    if (this.budgetCategory.budgetedAmounts.length > 0) {
      newAmount.amount = Object.assign(
        {},
        this.budgetCategory.budgetedAmounts[this.budgetCategory.budgetedAmounts.length - 1].amount,
      );
    }
    this.budgetCategory.budgetedAmounts.push(newAmount);
  }
}
</script>
