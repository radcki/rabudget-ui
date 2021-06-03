import { SingleResponse } from './SingleResponse';

export interface CollectionResponse<T> extends SingleResponse<T[]> {
  count: number;
  total: number;
  pageSize: number;
  pages: number;
}
