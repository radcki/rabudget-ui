import { format } from 'date-fns';
import { VueConstructor } from 'vue';
import Store from '@/store';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { Currency, NumberFormatInfo } from '@/typings/Currency';

function getSeparator(locale, separatorType) {
  const numberWithGroupAndDecimalSeparator = 10000.1;
  return Intl.NumberFormat(locale)
    .formatToParts(numberWithGroupAndDecimalSeparator)
    .find(part => part.type === separatorType).value;
}

export const CurrencyConfig = {
  install(Vue: VueConstructor) {
    Vue.prototype.$currencyConfig = function (value: MoneyAmount) {
      const currencies = (Store.state as any).dictionaries.currencies as Currency[];

      const currency = currencies.find(v => v.currencyCode == value.currencyCode);
      if (!currency) {
        return {
          symbol: '',
          thousandsSeparator: getSeparator(navigator.language, 'group'),
          fractionCount: 2,
          fractionSeparator: getSeparator(navigator.language, 'decimal'),
          symbolPosition: 'back',
          symbolSpacing: false,
        };
      }
      const nf = currency.numberFormat as NumberFormatInfo;
      return {
        symbol: nf.currencySymbol,
        thousandsSeparator: nf.currencyGroupSeparator,
        fractionCount: nf.currencyDecimalDigits,
        fractionSeparator: nf.currencyDecimalSeparator,
        symbolPosition: [0, 2].includes(nf.currencyPositivePattern || -1) ? 'front' : 'back',
        symbolSpacing: nf.currencyPositivePattern == 0 ? false : true,
      };
    };
  },
};
