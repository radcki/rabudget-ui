import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  subTransactionId: string;
  transactionDate: Date;
}

export interface Result extends SingleResponse<Date> {}
