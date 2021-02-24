import { MoneyAmount } from '@/typings/MoneyAmount';
import { CollectionResponse } from '../baseTypes/CollectionResponse';

export interface Query {
  budgetCategoryIds: string[];
}

export interface Result extends CollectionResponse<BudgetCategoryBalanceDto> {}

export interface BudgetCategoryBalanceDto {
  budgetCategoryId: string;
  totalTransactionsBalance: MoneyAmount;
  thisMonthTransactionsTotal: MoneyAmount;
  thisMonthBudgetedAmount: MoneyAmount;
}
