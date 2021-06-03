<template>
  <v-container>
    <v-card>
      <v-card-text>
        <v-text-field v-model="budget.name" filled :label="$t('newBudget.name')"></v-text-field>
        <currency-select
          v-model="budget.currencyCode"
          filled
          :return-object="false"
          :label="$t('newBudget.currency')"
        >
        </currency-select>
        <date-field
          v-model="budget.startingDate"
          filled
          :label="$t('newBudget.startingDate')"
        ></date-field>

        <category-icon-select color="primary" label="Ikona"></category-icon-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text :loading="$wait.is('saving.newBudget')" color="primary" @click="createBudget()">
          {{ $t('general.create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Currency } from '@/typings/Currency';
import * as CreateBudget from '@/typings/api/budget/CreateBudget';
import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';
import BudgetApi from '@/api/BudgetApi';
import { namespace } from 'vuex-class';

const dictionaries = namespace('dictionaries');
const budgetsStore = namespace('budgets');

@Component({
  components: {
    'date-field': () => import('@/components/DateField.vue'),
    'currency-select': () => import('@/components/CurrencySelect.vue'),
    'category-icon-select': () => import('@/components/CategoryIconSelect.vue'),
  },
})
export default class NewBudget extends Vue {
  step = 1;
  budget: CreateBudget.Command = {
    name: '',
    startingDate: new Date(),
    currencyCode: eCurrencyCode.PLN,
  };

  // eslint-disable-next-line no-unused-vars
  requiredRule: ((v) => boolean | string)[] = [
    v => !!v || this.$t('forms.requiredField').toString(),
  ];

  @dictionaries.State('currencies') currencies?: Currency[];
  @budgetsStore.Action('loadBudgets') loadBudgets!: () => Promise<void>;

  mounted() {
    //
  }

  async createBudget() {
    this.$wait.start('saving.newBudget');
    try {
      await BudgetApi.createBudget({
        name: this.budget.name,
        startingDate: this.budget.startingDate,
        currencyCode: this.budget.currencyCode,
      });
      this.loadBudgets();
    } catch {
      //todo
    } finally {
      this.$wait.end('saving.newBudget');
    }
  }
}
</script>
