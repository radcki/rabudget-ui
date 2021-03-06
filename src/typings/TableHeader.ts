import { DataTableCompareFunction } from 'vuetify';

export interface TableHeader<T> {
  value: keyof T | 'actions' | 'data-table-expand';
  text: string;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  divider?: boolean;
  class?: string | string[];
  width?: string | number;
  filter?: (value: any, search: string | null, item: any) => boolean;
  sort?: DataTableCompareFunction<T>;
}
