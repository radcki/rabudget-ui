import api from './ApiService';
import * as CreateAllocation from '@/typings/api/allocations/CreateAllocation';
import * as GetAllocationList from '@/typings/api/allocations/GetAllocationList';
import * as UpdateAllocationDescription from '@/typings/api/allocations/UpdateAllocationDescription';
import * as UpdateAllocationAmount from '@/typings/api/allocations/UpdateAllocationAmount';
import * as UpdateAllocationDate from '@/typings/api/allocations/UpdateAllocationDate';
import * as UpdateAllocationTargetCategory from '@/typings/api/allocations/UpdateAllocationTargetCategory';
import * as UpdateAllocationSourceCategory from '@/typings/api/allocations/UpdateAllocationSourceCategory';
import * as RemoveAllocation from '@/typings/api/allocations/RemoveAllocation';
import * as GetAllocationsDatesRange from '@/typings/api/allocations/GetAllocationsDatesRange';

class AllocationsApi {
  private baseUrl = 'Allocation/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }
  async getAllocationList(query: GetAllocationList.Query): Promise<GetAllocationList.Result> {
    const url = this.baseUrl + 'search';
    const data = await (await api.post<GetAllocationList.Result>(url, query)).data;
    for (const allocation of data.data) {
      allocation.allocationDate = new Date(allocation.allocationDate);
    }
    return data;
  }

  async createAllocation(command: CreateAllocation.Command): Promise<CreateAllocation.Result> {
    const url = this.baseUrl + 'create';
    return (await api.post<CreateAllocation.Result>(url, command)).data;
  }

  async updateAllocationDescription(
    command: UpdateAllocationDescription.Command,
  ): Promise<UpdateAllocationDescription.Result> {
    const url = this.baseUrl + 'update/description';
    return (await api.patch<UpdateAllocationDescription.Result>(url, command)).data;
  }

  async updateAllocationAmount(
    command: UpdateAllocationAmount.Command,
  ): Promise<UpdateAllocationAmount.Result> {
    const url = this.baseUrl + 'update/amount';
    return (await api.patch<UpdateAllocationAmount.Result>(url, command)).data;
  }

  async updateAllocationDate(
    command: UpdateAllocationDate.Command,
  ): Promise<UpdateAllocationDate.Result> {
    const url = this.baseUrl + 'update/allocation-date';
    const response = await api.patch<UpdateAllocationDate.Result>(url, command);
    response.data.data = new Date(response.data.data);
    return response.data;
  }

  async updateAllocationTargetCategory(
    command: UpdateAllocationTargetCategory.Command,
  ): Promise<UpdateAllocationTargetCategory.Result> {
    const url = this.baseUrl + 'update/target-budget-category';
    return (await api.patch<UpdateAllocationTargetCategory.Result>(url, command)).data;
  }

  async updateAllocationSourceCategory(
    command: UpdateAllocationSourceCategory.Command,
  ): Promise<UpdateAllocationSourceCategory.Result> {
    const url = this.baseUrl + 'update/source-budget-category';
    return (await api.patch<UpdateAllocationSourceCategory.Result>(url, command)).data;
  }

  async removeAllocation(command: RemoveAllocation.Command): Promise<RemoveAllocation.Result> {
    const url = this.baseUrl + 'remove';
    return (await api.post<RemoveAllocation.Result>(url, command)).data;
  }

  async getAllocationsDatesRange(
    query: GetAllocationsDatesRange.Query,
  ): Promise<GetAllocationsDatesRange.Result> {
    const url = this.baseUrl + 'get-dates-range';
    const data = await (await api.get<GetAllocationsDatesRange.Result>(url, query)).data;
    if (data.data.maxDate) data.data.maxDate = new Date(data.data.maxDate);
    if (data.data.minDate) data.data.minDate = new Date(data.data.minDate);
    return data;
  }
}

export default new AllocationsApi();
