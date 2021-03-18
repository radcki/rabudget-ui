import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  transactionTemplateId: string;
  description: string;
}

export interface Result extends SingleResponse<string> {}
