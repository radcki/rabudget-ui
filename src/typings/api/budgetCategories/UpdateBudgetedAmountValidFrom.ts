import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetedAmountId: string;
  validFrom: Date;
}

export interface Result extends SingleResponse<Date> {}
