import api from './ApiService';
import * as GetBudgetCategoriesList from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import * as CreateBudgetCategory from '@/typings/api/budgetCategories/CreateBudgetCategory';

class BudgetCategoriesApi {
  private baseUrl = 'budget-categories/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }

  async getBudgetsCategoriesList(
    query: GetBudgetCategoriesList.Query,
  ): Promise<GetBudgetCategoriesList.Response> {
    const url = this.baseUrl + 'get-list';
    const data = await (await api.get<GetBudgetCategoriesList.Response>(url, query)).data;
    for (const category of data.data) {
      for (const amount of category.budgetedAmounts) {
        amount.validFrom = new Date(amount.validFrom);
        amount.validTo = amount.validTo ? new Date(amount.validTo) : null;
      }
    }
    return data;
  }

  async createBudgetCategory(
    command: CreateBudgetCategory.Command,
  ): Promise<CreateBudgetCategory.Result> {
    const url = this.baseUrl + 'create';

    return await (await api.post<CreateBudgetCategory.Result>(url, command)).data;
  }
}

export default new BudgetCategoriesApi();
