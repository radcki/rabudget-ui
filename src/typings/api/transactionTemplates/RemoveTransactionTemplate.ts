import { BaseResponse } from '../baseTypes/BaseResponse';

export interface Command {
  transactionTemplateId: string;
}

export interface Result extends BaseResponse {}
