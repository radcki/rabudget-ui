import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { CollectionResponse } from '../baseTypes/CollectionResponse';
import { GridQuery } from '../baseTypes/GridQuery';

export interface Query extends GridQuery {
  budgetId: string;
  targetBudgetCategoryIds: string[];
  targetBudgetCategoryType: eBudgetCategoryType | null;
  sourceBudgetCategoryIds: string[];
  sourceBudgetCategoryType: eBudgetCategoryType | null;
  allocationDateStart: Date | null;
  allocationDateEnd: Date | null;
  minAmount: number | null;
  maxAmount: number | null;
}

export interface Result extends CollectionResponse<AllocationDto> {
  amountTotal: MoneyAmount | null;
}

export interface AllocationDto {
  allocationId: string;
  targetBudgetCategoryId: string;
  sourceBudgetCategoryId: string;
  amount: MoneyAmount;
  description: string;
  allocationDate: Date;
}
