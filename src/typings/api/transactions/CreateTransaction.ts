import { MoneyAmount } from '@/typings/MoneyAmount';
import { IdResponse } from '../baseTypes/IdResponse';

export interface Command {
  budgetCategoryId: string;
  amount: MoneyAmount;
  description: string;
  transactionDate: Date;
}

export interface Result extends IdResponse<string> {}
