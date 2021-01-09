import api from './ApiService';
import * as CreateAllocation from '@/typings/api/allocations/CreateAllocation';
import * as GetAllocationList from '@/typings/api/allocations/GetAllocationList';
import * as UpdateAllocationDescription from '@/typings/api/allocations/UpdateAllocationDescription';
import * as UpdateAllocationAmount from '@/typings/api/allocations/UpdateAllocationAmount';
import * as UpdateAllocationTargetCategory from '@/typings/api/allocations/UpdateAllocationTargetCategory';
import * as UpdateAllocationSourceCategory from '@/typings/api/allocations/UpdateAllocationSourceCategory';
import * as RemoveAllocation from '@/typings/api/allocations/RemoveAllocation';

class AllocationsApi {
  private baseUrl = 'Allocation/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }
  async getAllocationList(query: GetAllocationList.Query): Promise<GetAllocationList.Result> {
    const url = this.baseUrl + 'get-list';
    const data = await (await api.get<GetAllocationList.Result>(url, query)).data;
    for (const Allocation of data.data) {
      Allocation.allocationDate = new Date(Allocation.allocationDate);
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
}

export default new AllocationsApi();
