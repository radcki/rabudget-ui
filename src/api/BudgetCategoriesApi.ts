import api from './ApiService';
import * as GetBudgetCategoriesList from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import * as GetBudgetCategoryBalance from '@/typings/api/budgetCategories/GetBudgetCategoryBalance';
import * as CreateBudgetCategory from '@/typings/api/budgetCategories/CreateBudgetCategory';
import * as MoveBudgetCategoryDown from '@/typings/api/budgetCategories/MoveBudgetCategoryDown';
import * as MoveBudgetCategoryUp from '@/typings/api/budgetCategories/MoveBudgetCategoryUp';
import * as UpdateBudgetCategoryName from '@/typings/api/budgetCategories/UpdateBudgetCategoryName';
import * as UpdateBudgetCategoryIcon from '@/typings/api/budgetCategories/UpdateBudgetCategoryIcon';

import * as UpdateBudgetedAmountAmount from '@/typings/api/budgetCategories/UpdateBudgetedAmountAmount';
import * as UpdateBudgetedAmountValidFrom from '@/typings/api/budgetCategories/UpdateBudgetedAmountValidFrom';
import * as RemoveBudgetedAmount from '@/typings/api/budgetCategories/RemoveBudgetedAmount';
import * as AddBudgetedAmount from '@/typings/api/budgetCategories/AddBudgetedAmount';

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

  async getBudgetCategoryBalance(
    query: GetBudgetCategoryBalance.Query,
  ): Promise<GetBudgetCategoryBalance.Result> {
    const url = this.baseUrl + 'balance';
    const data = await (await api.get<GetBudgetCategoryBalance.Result>(url, query)).data;

    return data;
  }

  async moveBudgetCategoryUp(
    command: MoveBudgetCategoryUp.Command,
  ): Promise<MoveBudgetCategoryUp.Result> {
    const url = this.baseUrl + 'move-up';

    return await (await api.patch<MoveBudgetCategoryUp.Result>(url, command)).data;
  }

  async moveBudgetCategoryDown(
    command: MoveBudgetCategoryDown.Command,
  ): Promise<MoveBudgetCategoryDown.Result> {
    const url = this.baseUrl + 'move-down';

    return await (await api.patch<MoveBudgetCategoryDown.Result>(url, command)).data;
  }

  async updateBudgetCategoryName(
    command: UpdateBudgetCategoryName.Command,
  ): Promise<UpdateBudgetCategoryName.Result> {
    const url = this.baseUrl + 'update/name';

    return await (await api.patch<UpdateBudgetCategoryName.Result>(url, command)).data;
  }

  async updateBudgetCategoryIcon(
    command: UpdateBudgetCategoryIcon.Command,
  ): Promise<UpdateBudgetCategoryIcon.Result> {
    const url = this.baseUrl + 'update/icon';

    return await (await api.patch<UpdateBudgetCategoryIcon.Result>(url, command)).data;
  }

  async updateBudgetedAmountAmount(
    command: UpdateBudgetedAmountAmount.Command,
  ): Promise<UpdateBudgetedAmountAmount.Result> {
    const url = this.baseUrl + 'budgeted-amount/update/amount';

    return await (await api.patch<UpdateBudgetedAmountAmount.Result>(url, command)).data;
  }

  async updateBudgetedAmountValidFrom(
    command: UpdateBudgetedAmountValidFrom.Command,
  ): Promise<UpdateBudgetedAmountValidFrom.Result> {
    const url = this.baseUrl + 'budgeted-amount/update/valid-from';
    const response = await (await api.patch<UpdateBudgetedAmountValidFrom.Result>(url, command))
      .data;
    response.data = new Date(response.data);
    return response;
  }

  async removeBudgetedAmount(
    command: RemoveBudgetedAmount.Command,
  ): Promise<RemoveBudgetedAmount.Result> {
    const url = this.baseUrl + 'budgeted-amount/remove';

    return await (await api.post<RemoveBudgetedAmount.Result>(url, command)).data;
  }

  async addBudgetedAmount(command: AddBudgetedAmount.Command): Promise<AddBudgetedAmount.Result> {
    const url = this.baseUrl + 'budgeted-amount/add';
    const response = await (await api.post<AddBudgetedAmount.Result>(url, command)).data;
    response.data.validFrom = new Date(response.data.validFrom);
    if (response.data.validTo) response.data.validTo = new Date(response.data.validTo);
    return;
  }
}

export default new BudgetCategoriesApi();
