import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';
import { IdResponse } from '../baseTypes/IdResponse';

export interface Command {
  name: string;
  startingDate: Date;
  currencyCode: eCurrencyCode;
}

export interface Response extends IdResponse<string> {}
