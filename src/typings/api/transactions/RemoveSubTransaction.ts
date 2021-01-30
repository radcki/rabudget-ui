import { BaseResponse } from '../baseTypes/BaseResponse';

export interface Command {
  subTransactionId: string;
}

export interface Result extends BaseResponse {}
