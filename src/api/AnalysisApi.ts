import api from './ApiService';
import * as GetTransactionsTimeline from '@/typings/api/analysis/GetTransactionsTimeline';

class AnalysisApi {
  private baseUrl = 'analysis/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }

  async getTransactionsTimeline(
    query: GetTransactionsTimeline.Query,
  ): Promise<GetTransactionsTimeline.Result> {
    const url = this.baseUrl + 'get-transactions-timeline';
    const data = await (await api.get<GetTransactionsTimeline.Result>(url, query)).data;

    return data;
  }
}

export default new AnalysisApi();
