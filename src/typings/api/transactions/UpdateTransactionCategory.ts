import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  transactionId: string;
  budgetCategoryId: string;
}

export interface Result extends SingleResponse<string> {}
