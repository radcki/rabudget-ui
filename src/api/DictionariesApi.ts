import * as GetCurrencies from '@/typings/api/dictionaries/GetCurrencies';
import * as GetBudgetCategoryIcons from '@/typings/api/dictionaries/GetBudgetCategoryIcons';
import api from './ApiService';

class DictionariesApi {
  private baseUrl = 'dictionary/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }

  async getCurrencies(query: GetCurrencies.Query): Promise<GetCurrencies.Result> {
    const url = this.baseUrl + 'currencies';
    return await (await api.get<GetCurrencies.Result>(url)).data;
  }

  async getBudgetCategoryIcons(
    query: GetBudgetCategoryIcons.Query,
  ): Promise<GetBudgetCategoryIcons.Result> {
    const url = this.baseUrl + 'category-icons';
    return await (await api.get<GetBudgetCategoryIcons.Result>(url)).data;
  }
}

export default new DictionariesApi();
