import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Query {
  budgetId: string;
}

export interface BudgetBalanceDto {
  totalBalance: MoneyAmount;
  unassignedFunds: MoneyAmount;
  spendingTotal: MoneyAmount;
  incomeTotal: MoneyAmount;
  savingTotal: MoneyAmount;
}

export interface Response extends SingleResponse<BudgetBalanceDto> {}
