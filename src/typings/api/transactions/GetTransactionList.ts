import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { CollectionResponse } from '../baseTypes/CollectionResponse';
import { GridQuery } from '../baseTypes/GridQuery';

export interface Query extends GridQuery<TransactionDto> {
  budgetId: string;
  budgetCategoryIds?: string[];
  budgetCategoryType?: eBudgetCategoryType | null;
  transactionDateStart?: Date | null;
  transactionDateEnd?: Date | null;
  minAmount?: number | null;
  maxAmount?: number | null;
}

export interface Result extends CollectionResponse<TransactionDto> {}

export interface TransactionDto {
  transactionId: string;
  budgetCategoryId: string;
  amount: MoneyAmount;
  description: string;
  transactionDate: Date;
  subTransactions: SubTransactionDto[];
}

export interface SubTransactionDto {
  subTransactionId: string;
  amount: MoneyAmount;
  description: string;
  transactionDate: Date;
}
