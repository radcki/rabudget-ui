import { eCurrencyCode } from './enums/eCurrencyCode';

export interface MoneyAmount {
  currencyCode: eCurrencyCode;
  amount: number;
}
