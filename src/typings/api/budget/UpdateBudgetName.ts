import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetId: string;
  name: string;
}

export interface Response extends SingleResponse<string> {}
