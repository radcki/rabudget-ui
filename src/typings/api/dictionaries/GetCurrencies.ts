import { Currency } from '@/typings/Currency';
import { CollectionResponse } from '../baseTypes/CollectionResponse';

export interface Query {}

export interface Result extends CollectionResponse<Currency> {}
