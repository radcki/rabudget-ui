import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetCategoryId: string;
  amount: MoneyAmount;
  validFrom: Date;
}
export interface Result extends SingleResponse<BudgetedAmountDto> {}

export interface BudgetedAmountDto {
  budgetedAmountId: string;
  validFrom: Date;
  validTo: Date | null;
  amount: MoneyAmount;
}
