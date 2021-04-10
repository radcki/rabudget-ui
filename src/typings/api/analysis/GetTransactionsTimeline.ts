import { DateRange } from '@/typings/DateRange';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Query {
  budgetId: string;
  budgetCategoryIds: string[];
  budgetCategoryType: eBudgetCategoryType | null;
  transactionDateStart: Date;
  transactionDateEnd: Date;
  groupingStep: eGroupingStep;
}

export interface Result extends SingleResponse<ResponseDto> {}

export enum eGroupingStep {
  Year,
  Month,
  Quarter,
  Week,
  Day,
}

export interface ResponseDto {
  dateRanges: DateRangeData[];
  budgetCategoryTotals: BudgetCategoryDataPointDto[];
  total: DataPointDto;
}

export interface DateRangeData {
  key: string;
  dateRange: DateRange;
  budgetCategories: BudgetCategoryDataPointDto[];
  total: DataPointDto;
}

export interface DataPointDto {
  key: string;
  dateRange: DateRange;
  amountTotal: MoneyAmount;
  amountPerDay: MoneyAmount;
  amountPerWeek: MoneyAmount;
  amountPerMonth: MoneyAmount;
}

export interface BudgetCategoryDataPointDto {
  budgetCategoryId: string;
  key: string;
  dateRange: DateRange;
  amountTotal: MoneyAmount;
  amountPerDay: MoneyAmount;
  amountPerWeek: MoneyAmount;
  amountPerMonth: MoneyAmount;
}
