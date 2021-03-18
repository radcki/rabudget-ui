import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { CollectionResponse } from '../baseTypes/CollectionResponse';

export interface Query {
  budgetId: string;
  budgetCategoryType: eBudgetCategoryType | null;
}

export interface Result extends CollectionResponse<TransactionTemplateDto> {}

export interface TransactionTemplateDto {
  transactionTemplateId: string;
  budgetCategoryId: string;
  amount: MoneyAmount;
  description: string;
}
