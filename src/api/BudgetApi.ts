import api from './ApiService';
import * as GetBudgetList from '@/typings/api/budget/GetBudgetList';
import * as CreateBudget from '@/typings/api/budget/CreateBudget';
import * as UpdateBudgetName from '@/typings/api/budget/UpdateBudgetName';
import * as RemoveBudget from '@/typings/api/budget/RemoveBudget';
import * as UpdateBudgetStartingDate from '@/typings/api/budget/UpdateBudgetStartingDate';
import * as GetBudgetBalance from '@/typings/api/budget/GetBudgetBalance';

class BudgetApi {
  private baseUrl = 'budget/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }

  async getBudgetsList(query: GetBudgetList.Query): Promise<GetBudgetList.Response> {
    const url = this.baseUrl + 'get-list';
    const data = await (await api.get<GetBudgetList.Response>(url, query)).data;
    data.data = data.data.map(v => {
      v.startingDate = new Date(v.startingDate);
      return v;
    });
    return data;
  }

  async getBudgetsBalance(query: GetBudgetBalance.Query): Promise<GetBudgetBalance.Response> {
    const url = this.baseUrl + 'balance';
    const data = await (await api.get<GetBudgetBalance.Response>(url, query)).data;
    return data;
  }

  async createBudget(command: CreateBudget.Command): Promise<CreateBudget.Response> {
    const url = this.baseUrl + 'create';

    return await (await api.post<CreateBudget.Response>(url, command)).data;
  }

  async updateBudgetName(command: UpdateBudgetName.Command): Promise<UpdateBudgetName.Response> {
    const url = this.baseUrl + 'update/name';

    return await (await api.patch<UpdateBudgetName.Response>(url, command)).data;
  }

  async removeBudget(command: RemoveBudget.Command): Promise<RemoveBudget.Response> {
    const url = this.baseUrl + 'remove';

    return await (await api.post<UpdateBudgetName.Response>(url, command)).data;
  }

  async updateBudgetStartingDate(
    command: UpdateBudgetStartingDate.Command,
  ): Promise<UpdateBudgetStartingDate.Response> {
    const url = this.baseUrl + 'update/starting-date';

    return await (await api.patch<UpdateBudgetStartingDate.Response>(url, command)).data;
  }
}

export default new BudgetApi();
