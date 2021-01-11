export interface TableOptions<T> {
  page: number;
  itemsPerPage: number;
  sortBy: (keyof T)[];
  sortDesc: boolean[];
  groupBy: (keyof T)[];
  groupDesc: boolean[];
  multiSort: boolean;
  mustSort: boolean;
}
