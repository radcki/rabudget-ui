<template>
  <v-autocomplete
    v-model="innerValue"
    item-value="currencyCode"
    :item-text="v => v.symbol + ' - ' + v.nativeName"
    :filled="filled"
    :items="currencies"
    :filter="filter"
    :loading="$wait.is('loading.currencies')"
    :return-object="returnObject"
    :label="label"
  >
    <template #item="{ item, on }">
      <v-list-item v-on="on">
        <v-list-item-avatar class="my-0">
          {{ item.symbol }}
        </v-list-item-avatar>
        <v-list-item-content class="py-0">
          <v-list-item-title>
            {{ item.nativeName }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { Currency } from '@/typings/Currency';
import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';
import { namespace } from 'vuex-class';

const dictionaries = namespace('dictionaries');

@Component
export default class CurrencySelect extends Vue {
  @Prop({ type: [Object, Number] }) value!: eCurrencyCode | Currency;
  @Prop(Boolean) returnObject!: boolean;
  @Prop(Boolean) filled!: boolean;
  @Prop(String) label!: string;

  innerValue: eCurrencyCode | Currency | null = this.value ? this.value : null;

  created() {
    this.innerValue = this.value ? this.value : null;
  }
  @Watch('innerValue')
  onInnerValueChange(newValue) {
    this.$emit('input', newValue);
  }

  @Watch('value')
  onValueChange(newValue) {
    if (newValue != this.innerValue) {
      this.innerValue = newValue;
    }
  }

  @dictionaries.State('currencies') currencies?: Currency[];

  filter(item: Currency, queryText: string) {
    return (
      item.code.toLowerCase().includes(queryText.toLowerCase()) ||
      item.nativeName.toLowerCase().includes(queryText.toLowerCase()) ||
      item.englishName.toLowerCase().includes(queryText.toLowerCase())
    );
  }
}
</script>
