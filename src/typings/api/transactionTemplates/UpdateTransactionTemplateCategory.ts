import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  transactionTemplateId: string;
  budgetCategoryId: string;
}

export interface Result extends SingleResponse<string> {}
