import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Query {
  budgetCategoryId: string;
}

export interface Result extends SingleResponse<BudgetCategoryBalanceDto> {}

export interface BudgetCategoryBalanceDto {
  budgetCategoryId: string;
  totalCategoryBalance: MoneyAmount;
  thisMonthTransactionsTotal: MoneyAmount;
  budgetLeftToEndOfYear: MoneyAmount;
}
