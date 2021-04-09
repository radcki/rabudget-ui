<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{ $t('allocationsHistory.title') }}</v-subheader>
      </v-col>
      <v-col v-if="!isMobile" cols="4" class="pt-4">
        <v-text-field
          v-model="query.search"
          append-icon="mdi-magnify"
          :label="$t('general.search')"
          single-line
          solo
          hide-details
          @keyup.enter="fetchAllocations()"
          @click:append="fetchAllocations()"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="mt-1">
      <v-col v-if="filtersVisible" :class="!isMobile ? 'd-flex flex-grow-0' : ''">
        <v-row no-gutters>
          <v-col :cols="12">
            <filter-box v-model="query"></filter-box>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <v-col v-if="isMobile" cols="12" class="pt-4">
            <v-text-field
              v-model="query.search"
              append-icon="mdi-magnify"
              :label="$t('general.search')"
              single-line
              solo
              hide-details
              @keyup.enter="fetchAllocations()"
              @click:append="fetchAllocations()"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <template v-if="isLoading && isMobile" xs12 class="text-xs-center">
              <v-progress-circular
                :size="70"
                :width="7"
                color="amber darken-3"
                indeterminate
              ></v-progress-circular>
            </template>

            <v-card
              v-if="showAllocationsList"
              style="width: 100%"
              class="elevation-1 cardBackground"
            >
              <v-card-text>
                <v-data-table
                  v-if="$vuetify.breakpoint.smAndUp"
                  :headers="headers"
                  :items="allocations"
                  :loading="isLoading"
                  :search="search"
                  item-key="allocationId"
                  disable-pagination
                  hide-default-footer
                  :server-items-length="totalAllocations"
                  :options.sync="gridOptions"
                  :items-per-page-options="pageSizes"
                >
                  <template #item.sourceBudgetCategoryId="{ item }">
                    <inline-field
                      v-model="item.sourceBudgetCategoryId"
                      type="category"
                      clearable
                      :category-type="categoryType(item.targetBudgetCategoryId)"
                      :loading="
                        $wait.is(`saving.allocation.sourceBudgetCategory${item.allocationId}`)
                      "
                      @change="updateAllocationSourceCategory(item)"
                    ></inline-field>
                  </template>
                  <template #item.targetBudgetCategoryId="{ item }">
                    <inline-field
                      v-model="item.targetBudgetCategoryId"
                      type="category"
                      :category-type="categoryType(item.targetBudgetCategoryId)"
                      :loading="
                        $wait.is(`saving.allocation.targetBudgetCategory${item.allocationId}`)
                      "
                      @change="updateAllocationTargetCategory(item)"
                    ></inline-field>
                  </template>

                  <template #item.description="{ item }">
                    <inline-field
                      v-model="item.description"
                      :loading="$wait.is(`saving.allocation.description${item.allocationId}`)"
                      @change="updateAllocationDescription(item)"
                    ></inline-field>
                  </template>

                  <template #item.allocationDate="{ item }">
                    <nobr>
                      <inline-field
                        v-model="item.allocationDate"
                        type="date"
                        :loading="$wait.is(`saving.allocation.allocationDate${item.allocationId}`)"
                        @change="updateAllocationDate(item)"
                      ></inline-field>
                    </nobr>
                  </template>

                  <template #item.amount="{ item }">
                    <nobr>
                      <inline-field
                        v-model="item.amount"
                        type="money"
                        :loading="$wait.is(`saving.allocation.amount${item.allocationId}`)"
                        @change="updateAllocationAmount(item)"
                      ></inline-field>
                    </nobr>
                  </template>

                  <template #item.actions="{ item }">
                    <icon-button
                      :tooltip="$t('allocationHistory.removeAllocation')"
                      icon="mdi-trash-can"
                      color="red"
                      :loading="$wait.is(`removing.allocation${item.allocationId}`)"
                      @click="removeAllocation(item)"
                    ></icon-button>
                  </template>
                </v-data-table>

                <v-list v-if="isMobile" dense subheader>
                  <template v-for="(item, index) in allocations">
                    <v-list-item :key="`i_${item.allocationId}_${index}`" class="px-0 py-0">
                      <v-list-item-action class="my-0">
                        <v-row dense>
                          <v-col>
                            <inline-field
                              v-model="item.sourceBudgetCategoryId"
                              type="category"
                              style="min-width: 32px"
                              hide-category-name
                              :category-type="categoryType(item.sourceBudgetCategoryId)"
                              :loading="
                                $wait.is(
                                  `saving.allocation.sourceBudgetCategory${item.allocationId}`,
                                )
                              "
                              @change="updateAllocationSourceCategory(item)"
                            ></inline-field>
                          </v-col>
                          <v-col>
                            <v-icon>mdi-chevron-right</v-icon>
                          </v-col>
                          <v-col>
                            <inline-field
                              v-model="item.targetBudgetCategoryId"
                              style="min-width: 32px"
                              type="category"
                              hide-category-name
                              :category-type="categoryType(item.targetBudgetCategoryId)"
                              :loading="
                                $wait.is(
                                  `saving.allocation.targetBudgetCategory${item.allocationId}`,
                                )
                              "
                              @change="updateAllocationTargetCategory(item)"
                            ></inline-field>
                          </v-col>
                        </v-row>
                      </v-list-item-action>

                      <v-list-item-content class="py-1">
                        <v-list-item-title class="font-weight-medium">
                          <inline-field
                            v-model="item.description"
                            :loading="$wait.is(`saving.allocation.description${item.allocationId}`)"
                            @change="updatAllocationDescription(item)"
                          ></inline-field>
                        </v-list-item-title>

                        <v-list-item-subtitle class="text--primary">
                          <v-row no-gutters>
                            <v-col>
                              <inline-field
                                v-model="item.amount"
                                type="money"
                                :loading="$wait.is(`saving.allocation.amount${item.allocationId}`)"
                                @change="updateAllocationAmount(item)"
                              ></inline-field>
                            </v-col>
                            <v-col>
                              <inline-field
                                v-model="item.allocationDate"
                                type="date"
                                :loading="
                                  $wait.is(`saving.allocation.allocationDate${item.allocationId}`)
                                "
                                @change="updateSubAllocationDate(item)"
                              ></inline-field>
                            </v-col>
                          </v-row>
                        </v-list-item-subtitle>
                      </v-list-item-content>

                      <v-list-item-action :key="`a1_${item.allocationId}_${index}`" class="my-0">
                        <icon-button
                          icon="mdi-trash-can"
                          color="red"
                          :loading="$wait.is(`removing.subAllocation${item.allocationId}`)"
                          @click="removeAllocation(item)"
                        ></icon-button>
                      </v-list-item-action>
                    </v-list-item>
                    <v-divider
                      v-if="index < allocations.length - 1"
                      :key="`dv_${index}`"
                    ></v-divider>
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col :cols="12">
            <v-row justify="end">
              <v-col class="mr-2 d-flex flex-grow-0" style="min-width: 180px">
                <nobr class="pr-2 white--text">{{ $t('general.itemsPerPage') }}:</nobr>
                <v-select
                  v-model="gridOptions.itemsPerPage"
                  :items="pageSizes"
                  dense
                  solo
                  rounded
                  hide-details
                  style="max-width: 110px"
                ></v-select>
              </v-col>
              <v-col class="d-flex flex-grow-0 justify-end" style="min-width: 320px">
                <nobr class="pr-2 white--text">{{ $t('general.page') }}:</nobr>
                <v-sheet
                  color="white"
                  class="v-input v-text-field--rounded justify-center py-1 align-center"
                  style="max-width: 100px"
                >
                  <input
                    v-model="pageInput"
                    type="number"
                    class="text-center"
                    :min="1"
                    :max="pages"
                  />
                </v-sheet>

                <v-pagination
                  v-model="gridOptions.page"
                  circle
                  total-visible="0"
                  class="my-0 ml-4"
                  :length="pages"
                ></v-pagination>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { format } from 'date-fns';

import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import * as GetAllocationList from '@/typings/api/allocations/GetAllocationList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { TableHeader } from '@/typings/TableHeader';
import { TableOptions } from '@/typings/TableOptions';
import AllocationsApi from '@/api/AllocationsApi';
import { FieldOrderInfo } from '@/typings/api/baseTypes/GridQuery';
import InlineField from '@/components/InlineField.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'v-category-select': () => import('@/components/CategorySelect.vue'),
    'v-date-range-slider': () => import('@/components/DateRangeSlider.vue'),
    'filter-box': () => import('./components/FilterBox.vue'),
    InlineField,
  },
})
export default class Allocations extends Vue {
  search: string | null = null;
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @budgetsStore.Getter('activeBudgetCategories') categories!: BudgetCategoryDto[];

  query: GetAllocationList.Query = {
    budgetId: this.activeBudget ? this.activeBudget.budgetId : '',
    page: 1,
    pageSize: 10,
    targetBudgetCategoryIds: [],
    sourceBudgetCategoryIds: [],
    targetBudgetCategoryType: eBudgetCategoryType.Spending,
    sourceBudgetCategoryType: eBudgetCategoryType.Spending,
    search: '',
    allocationDateStart: null,
    allocationDateEnd: null,
    minAmount: null,
    maxAmount: null,
  };

  filtersVisible = true;

  headers: TableHeader<GetAllocationList.AllocationDto>[] = [
    {
      text: this.$t('allocation.targetBudgetCategory').toString(),
      sortable: true,
      value: 'targetBudgetCategoryId',
    },
    {
      text: this.$t('allocation.sourceBudgetCategory').toString(),
      sortable: true,
      value: 'sourceBudgetCategoryId',
    },
    {
      text: this.$t('general.date').toString(),
      sortable: true,
      value: 'allocationDate',
    },
    {
      text: this.$t('general.description').toString(),
      sortable: true,
      value: 'description',
    },
    {
      text: this.$t('general.amount').toString(),
      sortable: true,
      value: 'amount',
    },
    {
      text: this.$t('general.actions').toString(),
      sortable: false,
      value: 'actions',
    },
  ];

  format = format;
  eBudgetCategoryType = eBudgetCategoryType;
  allocations: GetAllocationList.AllocationDto[] = [];
  totalAllocations = 0;
  gridOptions: TableOptions<GetAllocationList.AllocationDto> = {
    sortBy: ['allocationDate'],
    page: 1,
    itemsPerPage: 20,
    sortDesc: [true],
    groupBy: [],
    groupDesc: [],
    multiSort: true,
    mustSort: false,
  };
  queryTimeout: NodeJS.Timeout | null = null;

  pageSizes = [20, 50, 100, 500];

  expandedAllocationIds: string[] = [];

  get pageInput(): string {
    return this.gridOptions.page.toString();
  }
  set pageInput(value: string) {
    let page = Number(value);
    if (this.gridOptions.page != page) {
      this.gridOptions.page = page;
    }
  }

  get pages() {
    return Math.ceil(this.totalAllocations / this.gridOptions.itemsPerPage);
  }

  get showAllocationsList() {
    return true;
  }

  get isLoading() {
    return this.$wait.is(`loading.allocations`);
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  mounted() {
    if (this.activeBudget) {
      this.fetchAllocations();
    }
  }

  categoryIcon(budgetCategoryId): string {
    return (
      this.categories.find(v => v.budgetCategoryId == budgetCategoryId)?.budgetCategoryIconKey || ''
    );
  }
  categoryName(budgetCategoryId): string {
    return this.categories.find(v => v.budgetCategoryId == budgetCategoryId)?.name || '';
  }

  categoryType(budgetCategoryId): eBudgetCategoryType {
    const categoryType = this.categories.find(v => v.budgetCategoryId == budgetCategoryId)
      ?.budgetCategoryType;

    return categoryType;
  }
  categoryColor(budgetCategoryId): string {
    const categoryType = this.categories.find(v => v.budgetCategoryId == budgetCategoryId)
      ?.budgetCategoryType;

    return categoryType ? eBudgetCategoryType[categoryType].toLowerCase() : '';
  }

  async fetchAllocations() {
    if (this.queryTimeout) {
      clearTimeout(this.queryTimeout);
    }
    this.queryTimeout = setTimeout(() => {
      this.executeFetchAllocations();
      this.queryTimeout = null;
    }, 200);
  }

  async executeFetchAllocations() {
    if (!this.activeBudget) {
      return;
    }
    this.$wait.start(`loading.allocations`);
    try {
      const orderColumns = this.gridOptions.sortBy.map((v, index) => {
        const sortDefinition: FieldOrderInfo<GetAllocationList.AllocationDto> = {
          fieldName: v,
          descending: this.gridOptions.sortDesc[index] || true,
        };
        return sortDefinition;
      });

      const data = await AllocationsApi.getAllocationList(
        Object.assign({}, this.query, {
          budgetId: this.activeBudget.budgetId,
          pageSize: this.gridOptions.itemsPerPage,
          page: this.gridOptions.page,
          dataOrder: orderColumns,
        }),
      );
      this.allocations = data.data;
      this.totalAllocations = data.total;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.allocations`);
    }
  }

  async updateAllocationDescription(allocation: GetAllocationList.AllocationDto) {
    this.$wait.start(`saving.allocation.description${allocation.allocationId}`);
    try {
      const result = await AllocationsApi.updateAllocationDescription({
        allocationId: allocation.allocationId,
        description: allocation.description,
      });
      allocation.description = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation.description${allocation.allocationId}`);
    }
  }

  async updateAllocationAmount(allocation: GetAllocationList.AllocationDto) {
    this.$wait.start(`saving.allocation.amount${allocation.allocationId}`);
    try {
      const result = await AllocationsApi.updateAllocationAmount({
        allocationId: allocation.allocationId,
        amount: allocation.amount,
      });
      allocation.amount = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation.amount${allocation.allocationId}`);
    }
  }

  async updateAllocationDate(allocation: GetAllocationList.AllocationDto) {
    this.$wait.start(`saving.allocation.allocationDate${allocation.allocationId}`);
    try {
      const result = await AllocationsApi.updateAllocationDate({
        allocationId: allocation.allocationId,
        allocationDate: allocation.allocationDate,
      });
      allocation.allocationDate = result.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation.allocationDate${allocation.allocationId}`);
    }
  }

  async updateAllocationSourceCategory(allocation: GetAllocationList.AllocationDto) {
    this.$wait.start(`saving.allocation.sourceBudgetCategory${allocation.allocationId}`);
    try {
      const result = await AllocationsApi.updateAllocationSourceCategory({
        allocationId: allocation.allocationId,
        sourceBudgetCategoryId: allocation.sourceBudgetCategoryId,
      });
      allocation.sourceBudgetCategoryId = result.id;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation.sourceBudgetCategory${allocation.allocationId}`);
    }
  }
  async updateAllocationTargetCategory(allocation: GetAllocationList.AllocationDto) {
    this.$wait.start(`saving.allocation.sourceBudgetCategory${allocation.allocationId}`);
    try {
      const result = await AllocationsApi.updateAllocationTargetCategory({
        allocationId: allocation.allocationId,
        targetBudgetCategoryId: allocation.targetBudgetCategoryId,
      });
      allocation.targetBudgetCategoryId = result.id;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.allocation.sourceBudgetCategory${allocation.allocationId}`);
    }
  }

  async removeAllocation(allocation: GetAllocationList.AllocationDto) {
    const confirmed = await this.$msgBox.confirm(
      this.$t('allocation.removeConfirmTitle').toString(),
      this.$t('allocation.removeConfirm').toString(),
    );
    if (!confirmed) {
      return;
    }
    this.$wait.start(`removing.allocation${allocation.allocationId}`);
    try {
      await AllocationsApi.removeAllocation({
        allocationId: allocation.allocationId,
      });
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`removing.allocation${allocation.allocationId}`);
    }
  }

  showFilters() {
    this.filtersVisible = true;
  }
  hideFilters() {
    this.filtersVisible = false;
  }

  @Watch('activeBudget')
  async onBudgetChange() {
    await this.fetchAllocations();
  }

  @Watch('query')
  async onQueryChange() {
    await this.fetchAllocations();
  }

  @Watch('pageSize')
  onPageSizeChange() {
    this.fetchAllocations();
  }

  @Watch('gridOptions', { deep: true })
  onTableOptionsChange() {
    this.fetchAllocations();
  }
}
</script>
