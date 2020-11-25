import { Currency } from '@/typings/Currency';
import { CollectionResponse } from '../baseTypes/CollectionResponse';

export interface Query {}

export interface Response extends CollectionResponse<Budget> {}

export interface Budget {
  budgetId: string;
  name: string;
  startingDate: Date;
  currency: Currency;
}
