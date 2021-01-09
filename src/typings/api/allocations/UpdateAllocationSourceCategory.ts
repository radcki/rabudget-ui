import { IdResponse } from '../baseTypes/IdResponse';

export interface Command {
  allocationId: string;
  sourceBudgetCategoryId: string;
}

export interface Result extends IdResponse<string> {}
