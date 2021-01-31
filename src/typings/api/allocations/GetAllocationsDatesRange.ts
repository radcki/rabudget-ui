import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Query {
  budgetId: string;
}

export interface Result extends SingleResponse<DatesRangeDto> {}

export interface DatesRangeDto {
  minDate: Date | null;
  maxDate: Date | null;
}
