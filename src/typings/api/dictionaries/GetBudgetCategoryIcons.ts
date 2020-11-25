import { CollectionResponse } from '../baseTypes/CollectionResponse';

export interface Query {}

export interface Result extends CollectionResponse<BudgetCategoryIconDto> {}

export interface BudgetCategoryIconDto {
  budgetCategoryIconId: string;
  iconKey: string;
}
