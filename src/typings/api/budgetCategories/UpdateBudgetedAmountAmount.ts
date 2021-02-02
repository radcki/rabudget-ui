import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetedAmountId: string;
  amount: MoneyAmount;
}

export interface Result extends SingleResponse<MoneyAmount> {}
