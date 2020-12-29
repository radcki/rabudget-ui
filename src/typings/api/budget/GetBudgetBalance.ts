import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Query {
  budgetId: string;
}

export interface Response extends SingleResponse<MoneyAmount> {}
