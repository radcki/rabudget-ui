import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  allocationId: string;
  allocationDate: Date;
}

export interface Result extends SingleResponse<Date> {}
