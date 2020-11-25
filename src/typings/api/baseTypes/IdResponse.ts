import { BaseResponse } from './BaseResponse';

export interface IdResponse<T> extends BaseResponse {
  id: T;
}
