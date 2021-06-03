<template>
  <v-list-item>
    <v-list-item-avatar>
      <inline-field
        v-model="innerValue.budgetCategoryId"
        type="category"
        hide-category-name
        :category-type="categoryType"
        :loading="categoryIsSaving"
        @change="updateTransactionTemplateCategory()"
      ></inline-field>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <inline-field
          v-model="innerValue.description"
          type="text"
          :loading="descriptionIsSaving"
          @change="updateTransactionTemplateDescription()"
        ></inline-field>
      </v-list-item-title>
      <v-list-item-subtitle>
        <inline-field
          v-model="innerValue.amount"
          type="money"
          :loading="amountIsSaving"
          @change="updateTransactionTemplateAmount()"
        ></inline-field>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <icon-button
        icon="mdi-basket-fill"
        color="primary"
        :tooltip="$t('transaction.applyTemplate')"
        @click="$emit('load-template')"
      ></icon-button>
    </v-list-item-action>
    <v-list-item-action>
      <icon-button
        icon="mdi-delete"
        color="red"
        :tooltip="$t('transaction.removeTemplate')"
        @click="removeTransactionTemplate()"
      ></icon-button>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import InlineField from '@/components/InlineField.vue';
//import * as UpdateTransactionTemplateAmount from '@/typings/api/transactionTemplates/UpdateTransactionTemplateAmount';
//mport * as UpdateTransactionTemplateCategory from '@/typings/api/transactionTemplates/UpdateTransactionTemplateCategory';
//import * as UpdateTransactionTemplateDescription from '@/typings/api/transactionTemplates/UpdateTransactionTemplateDescription';
import { TransactionTemplateDto } from '@/typings/api/transactionTemplates/GetTransactionTemplateList';
import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import TransactionTemplatesApi from '@/api/TransactionTemplatesApi';
import { namespace } from 'vuex-class';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    InlineField,
  },
})
export default class TransactionTemplateListItem extends Vue {
  @Prop(Object) value!: TransactionTemplateDto;
  @Prop(Number) categoryType!: eBudgetCategoryType;

  innerValue: TransactionTemplateDto = Object.assign({}, this.value);

  created() {
    this.innerValue = Object.assign({}, this.value);
  }

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;

  get currencyCode(): eCurrencyCode {
    return this.activeBudget ? this.activeBudget.currency.currencyCode : 0;
  }

  get descriptionIsSaving() {
    return this.$wait.is(
      `saving.transactionTemplateDescription_${this.innerValue.transactionTemplateId}`,
    );
  }
  get amountIsSaving() {
    return this.$wait.is(
      `saving.transactionTemplateAmount_${this.innerValue.transactionTemplateId}`,
    );
  }
  get categoryIsSaving() {
    return this.$wait.is(
      `saving.transactionTemplateCategory_${this.innerValue.transactionTemplateId}`,
    );
  }

  async updateTransactionTemplateDescription() {
    this.$wait.start(
      `saving.transactionTemplateDescription_${this.innerValue.transactionTemplateId}`,
    );
    try {
      await TransactionTemplatesApi.updateTransactionTemplateDescription({
        transactionTemplateId: this.innerValue.transactionTemplateId,
        description: this.innerValue.description,
      });
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(
        `saving.transactionTemplateDescription_${this.innerValue.transactionTemplateId}`,
      );
    }
  }

  async updateTransactionTemplateAmount() {
    this.$wait.start(`saving.transactionTemplateAmount_${this.innerValue.transactionTemplateId}`);
    try {
      await TransactionTemplatesApi.updateTransactionTemplateAmount({
        transactionTemplateId: this.innerValue.transactionTemplateId,
        amount: this.innerValue.amount,
      });
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transactionTemplateAmount_${this.innerValue.transactionTemplateId}`);
    }
  }

  async updateTransactionTemplateCategory() {
    this.$wait.start(`saving.transactionTemplateCategory_${this.innerValue.transactionTemplateId}`);
    try {
      await TransactionTemplatesApi.updateTransactionTemplateCategory({
        transactionTemplateId: this.innerValue.transactionTemplateId,
        budgetCategoryId: this.innerValue.budgetCategoryId,
      });
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transactionTemplateCategory_${this.innerValue.transactionTemplateId}`);
    }
  }

  async removeTransactionTemplate() {
    const confirmed = await this.$msgBox.confirm(
      this.$t('transaction.templateRemoveConfirmTitle').toString(),
      this.$t('transaction.templateRemoveConfirmMessage').toString(),
    );
    if (!confirmed) {
      return;
    }
    this.$wait.start(`saving.transactionTemplateAmount_${this.innerValue.transactionTemplateId}`);
    try {
      await TransactionTemplatesApi.removeTransactionTemplate({
        transactionTemplateId: this.innerValue.transactionTemplateId,
      });
      this.$emit('removed');
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.transactionTemplateAmount_${this.innerValue.transactionTemplateId}`);
    }
  }

  @Watch('innerValue', { deep: true })
  onInnerValueChange() {
    this.$emit('input', this.innerValue);
  }

  @Watch('value')
  onValueChange(newValue) {
    this.innerValue = Object.assign(this.innerValue, newValue);
  }
}
</script>
