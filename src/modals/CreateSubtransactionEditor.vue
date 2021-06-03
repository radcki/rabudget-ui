<template>
  <div>
    <v-form>
      <v-row dense>
        <v-col>
          <date-field
            v-model="subTransaction.transactionDate"
            filled
            :label="$t('transaction.transactionDate')"
          ></date-field>
        </v-col>
        <v-col>
          <v-text-field
            v-model="subTransaction.description"
            filled
            :label="$t('transaction.description')"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <money-field
            v-model="subTransaction.amount"
            filled
            :label="$t('transaction.amount')"
          ></money-field>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import MoneyField from '@/components/MoneyField.vue';
import DateField from '@/components/DateField.vue';
import * as AddSubTransaction from '@/typings/api/transactions/AddSubTransaction';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    DateField,
    MoneyField,
  },
})
export default class CreateSubtransactionEditor extends Vue {
  @Inject('setPayload') setPayload!: any;
  @Inject('payload') payload!: AddSubTransaction.Command;

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;

  subTransaction: AddSubTransaction.Command = Object.assign({}, this.payload);

  created() {
    this.subTransaction = Object.assign({}, this.payload);
  }

  @Watch('subTransaction', { deep: true })
  onInput() {
    this.setPayload(this.subTransaction);
  }
}
</script>
