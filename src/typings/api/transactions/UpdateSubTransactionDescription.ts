import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  subTransactionId: string;
  description: string;
}

export interface Result extends SingleResponse<string> {}
