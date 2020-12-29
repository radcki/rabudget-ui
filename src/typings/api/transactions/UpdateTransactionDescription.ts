import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  transactionId: string;
  description: string;
}

export interface Result extends SingleResponse<string> {}
