<template>
  <div>
    <template v-if="!isMobile">
      <v-data-table
        disable-filtering
        disable-pagination
        hide-default-footer
        dense
        :headers="subtransactionHeaders"
        :items="items"
      >
        <template #[`item.description`]="{ item }">
          <inline-field
            v-model="item.description"
            :loading="$wait.is(`saving.subTransaction.description${item.subTransactionId}`)"
            @change="updateSubTransactionDescription(item)"
          ></inline-field>
        </template>

        <template #[`item.transactionDate`]="{ item }">
          <inline-field
            v-if="item.transactionDate"
            v-model="item.transactionDate"
            type="date"
            :loading="$wait.is(`saving.subTransaction.transactionDate${item.subTransactionId}`)"
            @change="updateSubTransactionDate(item)"
          ></inline-field>
        </template>

        <template #[`item.amount`]="{ item }">
          <inline-field
            v-model="item.amount"
            type="money"
            :loading="$wait.is(`saving.subTransaction.amount${item.subTransactionId}`)"
            @change="updateSubTransactionAmount(item)"
          ></inline-field>
        </template>

        <template #[`item.actions`]="{ item }">
          <icon-button
            :tooltip="$t('transaction.removeTransanction')"
            icon="mdi-trash-can"
            color="red"
            :loading="$wait.is(`removing.subTransaction${item.subTransactionId}`)"
            @click="removeSubTransaction(item)"
          ></icon-button>
        </template>
      </v-data-table>
    </template>
    <template v-else>
      <template v-for="(subTransaction, subTransactionIndex) in items">
        <v-list-item
          :key="`i_${subTransaction.subTransactionId}_${subTransactionIndex}`"
          class="pl-5 pr-0 py-0"
        >
          <v-list-item-content class="py-1">
            <v-list-item-title class="font-weight-medium">
              <inline-field
                v-model="subTransaction.description"
                :loading="
                  $wait.is(`saving.subTransaction.description${subTransaction.subTransactionId}`)
                "
                @change="updateSubTransactionDescription(subTransaction)"
              ></inline-field>
            </v-list-item-title>

            <v-list-item-subtitle class="text--primary">
              <v-row no-gutters>
                <v-col>
                  <inline-field
                    v-model="subTransaction.amount"
                    type="money"
                    :loading="
                      $wait.is(`saving.subTransaction.amount${subTransaction.subTransactionId}`)
                    "
                    @change="updateSubTransactionAmount(subTransaction)"
                  ></inline-field>
                </v-col>
                <v-col>
                  <inline-field
                    v-model="subTransaction.transactionDate"
                    type="date"
                    :loading="
                      $wait.is(
                        `saving.subTransaction.transactionDate${subTransaction.subTransactionId}`,
                      )
                    "
                    @change="updateSubTransactionDate(item)"
                  ></inline-field>
                </v-col>
              </v-row>
            </v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action
            :key="`a1_${subTransaction.subTransactionId}_${subTransactionIndex}`"
            class="my-0"
          >
            <icon-button
              icon="mdi-trash-can"
              color="red"
              :loading="$wait.is(`removing.subTransaction${subTransaction.subTransactionId}`)"
              @click="removeSubTransaction(subTransaction)"
            ></icon-button>
          </v-list-item-action>
        </v-list-item>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import * as GetTransactionList from '@/typings/api/transactions/GetTransactionList';
import TransactionsApi from '@/api/TransactionsApi';
import { TableHeader } from '@/typings/TableHeader';

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
  },
})
export default class SubtransactionsList extends Vue {
  @Prop(Array) items!: GetTransactionList.SubTransactionDto[];

  subtransactionHeaders: TableHeader<GetTransactionList.SubTransactionDto>[] = [
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

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }
  async updateSubTransactionDescription(subTransactionId: GetTransactionList.SubTransactionDto) {
    this.$wait.start(`saving.subTransaction.description${subTransactionId.subTransactionId}`);
    try {
      const result = await TransactionsApi.updateSubTransactionDescription({
        subTransactionId: subTransactionId.subTransactionId,
        description: subTransactionId.description,
      });
      subTransactionId.description = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.subTransaction.description${subTransactionId.subTransactionId}`);
    }
  }

  async updateSubTransactionAmount(subTransaction: GetTransactionList.SubTransactionDto) {
    this.$wait.start(`saving.subTransaction.amount${subTransaction.subTransactionId}`);
    try {
      const result = await TransactionsApi.updateSubTransactionAmount({
        subTransactionId: subTransaction.subTransactionId,
        amount: subTransaction.amount,
      });
      subTransaction.amount = result.data;
      this.$emit('amount-changed');
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.subTransaction.amount${subTransaction.subTransactionId}`);
    }
  }

  async updateSubTransactionDate(subTransaction: GetTransactionList.SubTransactionDto) {
    this.$wait.start(`saving.subTransaction.subTransactionDate${subTransaction.subTransactionId}`);
    try {
      const result = await TransactionsApi.updateSubTransactionDate({
        subTransactionId: subTransaction.subTransactionId,
        transactionDate: subTransaction.transactionDate,
      });
      subTransaction.transactionDate = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.subTransaction.subTransactionDate${subTransaction.subTransactionId}`);
    }
  }

  async removeSubTransaction(subTransaction: GetTransactionList.SubTransactionDto) {
    const confirmed = await this.$msgBox.confirm(
      this.$t('transactionHistory.subtransactions.removeConfirmTitle').toString(),
      this.$t('transactionHistory.subtransactions.removeConfirm').toString(),
    );
    if (!confirmed) {
      return;
    }
    this.$wait.start(`removing.subTransaction${subTransaction.subTransactionId}`);
    try {
      await TransactionsApi.removeSubTransaction({
        subTransactionId: subTransaction.subTransactionId,
      });
      this.$emit('removed');
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`removing.subTransaction${subTransaction.subTransactionId}`);
    }
  }
}
</script>
