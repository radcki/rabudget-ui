import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Query {
  budgetId: string;
}

export interface Result extends SingleResponse<SummaryDto> {}

export interface SummaryDto {
  spendingSummary: BudgetedAmountSummaryDto;
  incomeSummary: BudgetedAmountSummaryDto;
  savingSummary: BudgetedAmountSummaryDto;
  totalSummary: BudgetedAmountSummaryDto;
}

export interface BudgetedAmountSummaryDto {
  currentBudgetedAmount: MoneyAmount;
  thisYearBudgetedAmount: MoneyAmount;
  totalBudgetedAmount: MoneyAmount;
}
