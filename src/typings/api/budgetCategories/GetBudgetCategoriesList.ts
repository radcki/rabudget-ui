import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { CollectionResponse } from '../baseTypes/CollectionResponse';
import { MoneyAmount } from '../../MoneyAmount';

export interface Query {
  budgetId: string;
  budgetCategoryTypes?: eBudgetCategoryType[];
}

export interface Response extends CollectionResponse<BudgetCategoryDto> {}

export interface BudgetCategoryDto {
  budgetCategoryId: string;
  budgetId: string;
  budgetCategoryIconKey: string;
  budgetCategoryIconId: string;
  budgetCategoryType: eBudgetCategoryType;
  order: number;
  name: string;
  budgetedAmounts: BudgetedAmountDto[];
  currentBudgetedAmount: MoneyAmount;
}

export interface BudgetedAmountDto {
  budgetedAmountId: string;
  validFrom: Date;
  validTo: Date | null;
  amount: MoneyAmount;
}
