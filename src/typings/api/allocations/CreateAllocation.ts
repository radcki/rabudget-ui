import { MoneyAmount } from '@/typings/MoneyAmount';
import { IdResponse } from '../baseTypes/IdResponse';

export interface Command {
  targetBudgetCategoryId: string;
  sourceBudgetCategoryId: string;
  amount: MoneyAmount;
  description: string;
  allocationDate: Date;
}

export interface Result extends IdResponse<string> {}
