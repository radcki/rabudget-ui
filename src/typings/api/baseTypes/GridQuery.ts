import { CollectionQuery } from './CollectionQuery';

export interface GridQuery<T = any> extends CollectionQuery {
  page: number;
  pageSize: number;
  dataOrder?: FieldOrderInfo<T>[];
}
export interface FieldOrderInfo<T> {
  fieldName: keyof T;
  descending: boolean;
}
