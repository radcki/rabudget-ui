import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  allocationId: string;
  description: string;
}

export interface Result extends SingleResponse<string> {}
