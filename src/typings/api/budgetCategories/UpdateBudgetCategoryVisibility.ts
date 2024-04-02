import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetCategoryId: string;
  hidden: boolean;
}

export interface Result extends SingleResponse<boolean> {}
