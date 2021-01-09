import { IdResponse } from '../baseTypes/IdResponse';

export interface Command {
  allocationId: string;
  targetBudgetCategoryId: string;
}

export interface Result extends IdResponse<string> {}
