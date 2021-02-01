import { SingleResponse } from '../baseTypes/SingleResponse';

export interface Command {
  budgetCategoryId: string;
  budgetCategoryIconId: string;
}

export interface Result extends SingleResponse<IconDto> {}

export interface IconDto {
  iconId: string;
  iconKey: string;
}
