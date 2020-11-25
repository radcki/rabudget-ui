import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetId: string;
  startingDate: Date;
}

export interface Response extends SingleResponse<Date> {}
