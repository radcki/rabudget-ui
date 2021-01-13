import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  transactionId: string;
  transactionDate: Date;
}

export interface Result extends SingleResponse<Date> {}
