import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetCategoryId: string;
  name: string;
}

export interface Result extends SingleResponse<string> {}
