import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetedAmountId: string;
  validFrom: Date;
}

export interface Result extends SingleResponse<BudgetCategoryDto> {}

export interface BudgetCategoryDto {
  budgetCategoryId: string;
  budgetCategoryIconKey: string;
  budgetCategoryIconId: string;
  budgetId: string;
  budgetCategoryType: eBudgetCategoryType;
  order: number;
  name: string;
  currentBudgetedAmount: MoneyAmount;
  budgetedAmounts: BudgetedAmountDto[];
}

export interface BudgetedAmountDto {
  budgetedAmountId: string;
  validFrom: Date;
  validTo: Date | null;
  amount: MoneyAmount;
}
