import { Currency, NumberFormatInfo } from '@/typings/Currency';
import { eCurrencyCode } from '@/typings/enums/eCurrencyCode';
import { CollectionResponse } from '../baseTypes/CollectionResponse';

export interface Query {}

export interface Result extends CollectionResponse<Currency> {}
