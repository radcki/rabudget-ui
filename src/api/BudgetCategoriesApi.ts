import api from './ApiService';
import * as GetBudgetCategoriesList from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import * as GetBudgetCategoryBalance from '@/typings/api/budgetCategories/GetBudgetCategoryBalance';
import * as GetCurrentBudgetCategorySummary from '@/typings/api/budgetCategories/GetCurrentBudgetCategorySummary';
import * as GetBudgetedAmountsSummary from '@/typings/api/budgetCategories/GetBudgetedAmountsSummary';
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

    return await (
      await api.post<CreateBudgetCategory.Result>(url, command)
    ).data;
  }

  async getBudgetCategoryBalance(
    query: GetBudgetCategoryBalance.Query,
  ): Promise<GetBudgetCategoryBalance.Result> {
    const url = this.baseUrl + 'balance';
    const data = await (await api.get<GetBudgetCategoryBalance.Result>(url, query)).data;

    return data;
  }

  async getBudgetedAmountsSummary(
    query: GetBudgetedAmountsSummary.Query,
  ): Promise<GetBudgetedAmountsSummary.Result> {
    const url = this.baseUrl + 'get-budgeted-amounts-summary';
    const data = await (await api.get<GetBudgetedAmountsSummary.Result>(url, query)).data;

    return data;
  }

  async getCurrentBudgetCategoryBalance(
    query: GetCurrentBudgetCategorySummary.Query,
  ): Promise<GetCurrentBudgetCategorySummary.Result> {
    const url = this.baseUrl + 'current-balance';
    const data = await (await api.get<GetCurrentBudgetCategorySummary.Result>(url, query)).data;

    return data;
  }

  async moveBudgetCategoryUp(
    command: MoveBudgetCategoryUp.Command,
  ): Promise<MoveBudgetCategoryUp.Result> {
    const url = this.baseUrl + 'move-up';

    return await (
      await api.patch<MoveBudgetCategoryUp.Result>(url, command)
    ).data;
  }

  async moveBudgetCategoryDown(
    command: MoveBudgetCategoryDown.Command,
  ): Promise<MoveBudgetCategoryDown.Result> {
    const url = this.baseUrl + 'move-down';

    return await (
      await api.patch<MoveBudgetCategoryDown.Result>(url, command)
    ).data;
  }

  async updateBudgetCategoryName(
    command: UpdateBudgetCategoryName.Command,
  ): Promise<UpdateBudgetCategoryName.Result> {
    const url = this.baseUrl + 'update/name';

    return await (
      await api.patch<UpdateBudgetCategoryName.Result>(url, command)
    ).data;
  }

  async updateBudgetCategoryIcon(
    command: UpdateBudgetCategoryIcon.Command,
  ): Promise<UpdateBudgetCategoryIcon.Result> {
    const url = this.baseUrl + 'update/icon';

    return await (
      await api.patch<UpdateBudgetCategoryIcon.Result>(url, command)
    ).data;
  }

  async updateBudgetedAmountAmount(
    command: UpdateBudgetedAmountAmount.Command,
  ): Promise<UpdateBudgetedAmountAmount.Result> {
    const url = this.baseUrl + 'budgeted-amount/update/amount';
    const response = await (await api.patch<UpdateBudgetedAmountAmount.Result>(url, command)).data;

    response.data.budgetedAmounts.forEach(budgetedAmount => {
      budgetedAmount.validFrom = new Date(budgetedAmount.validFrom);
      if (budgetedAmount.validTo) budgetedAmount.validTo = new Date(budgetedAmount.validTo);
    });
    return response;
  }

  async updateBudgetedAmountValidFrom(
    command: UpdateBudgetedAmountValidFrom.Command,
  ): Promise<UpdateBudgetedAmountValidFrom.Result> {
    const url = this.baseUrl + 'budgeted-amount/update/valid-from';
    const response = await (
      await api.patch<UpdateBudgetedAmountValidFrom.Result>(url, command)
    ).data;
    response.data.budgetedAmounts.forEach(budgetedAmount => {
      console.log(budgetedAmount);
      budgetedAmount.validFrom = new Date(budgetedAmount.validFrom);
      if (budgetedAmount.validTo) budgetedAmount.validTo = new Date(budgetedAmount.validTo);
    });
    return response;
  }

  async removeBudgetedAmount(
    command: RemoveBudgetedAmount.Command,
  ): Promise<RemoveBudgetedAmount.Result> {
    const url = this.baseUrl + 'budgeted-amount/remove';

    const response = await (await api.post<RemoveBudgetedAmount.Result>(url, command)).data;
    response.data.budgetedAmounts.forEach(budgetedAmount => {
      budgetedAmount.validFrom = new Date(budgetedAmount.validFrom);
      if (budgetedAmount.validTo) budgetedAmount.validTo = new Date(budgetedAmount.validTo);
    });
    return response;
  }

  async addBudgetedAmount(command: AddBudgetedAmount.Command): Promise<AddBudgetedAmount.Result> {
    const url = this.baseUrl + 'budgeted-amount/add';
    const response = await (await api.post<AddBudgetedAmount.Result>(url, command)).data;
    response.data.budgetedAmounts.forEach(budgetedAmount => {
      budgetedAmount.validFrom = new Date(budgetedAmount.validFrom);
      if (budgetedAmount.validTo) budgetedAmount.validTo = new Date(budgetedAmount.validTo);
    });
    return response;
  }
}

export default new BudgetCategoriesApi();
