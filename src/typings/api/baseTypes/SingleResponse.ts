import { BaseResponse } from './BaseResponse';

export interface SingleResponse<T> extends BaseResponse {
  data: T;
}
