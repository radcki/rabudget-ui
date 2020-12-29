import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { IdResponse } from '../baseTypes/IdResponse';

export interface Command {
  budgetId: string;
  name: string;
  budgetCategoryIconId: string;
  budgetCategoryType: eBudgetCategoryType;
  budgetedAmounts: BudgetedAmount[];
}

export interface BudgetedAmount {
  amount: MoneyAmount;
  validFrom: Date;
}

export interface Result extends IdResponse<string> {}
