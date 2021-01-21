import api from './ApiService';
import * as CreateTransaction from '@/typings/api/transactions/CreateTransaction';
import * as GetTransactionList from '@/typings/api/transactions/GetTransactionList';
import * as UpdateTransactionDescription from '@/typings/api/transactions/UpdateTransactionDescription';
import * as UpdateTransactionAmount from '@/typings/api/transactions/UpdateTransactionAmount';
import * as UpdateTransactionDate from '@/typings/api/transactions/UpdateTransactionDate';
import * as RemoveTransaction from '@/typings/api/transactions/RemoveTransaction';
import * as GetTransactionsDatesRange from '@/typings/api/transactions/GetTransactionsDatesRange';
import * as UpdateTransactionCategory from '@/typings/api/transactions/UpdateTransactionCategory';

class TransactionsApi {
  private baseUrl = 'transaction/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }
  async getTransactionList(query: GetTransactionList.Query): Promise<GetTransactionList.Result> {
    const url = this.baseUrl + 'get-list';
    const data = await (await api.get<GetTransactionList.Result>(url, query)).data;
    for (const transaction of data.data) {
      transaction.transactionDate = new Date(transaction.transactionDate);

      for (const subTransaction of transaction.subTransactions) {
        subTransaction.transactionDate = new Date(subTransaction.transactionDate);
      }
    }
    return data;
  }

  async createTransaction(command: CreateTransaction.Command): Promise<CreateTransaction.Result> {
    const url = this.baseUrl + 'create';
    return (await api.post<CreateTransaction.Result>(url, command)).data;
  }

  async updateTransactionDescription(
    command: UpdateTransactionDescription.Command,
  ): Promise<UpdateTransactionDescription.Result> {
    const url = this.baseUrl + 'update/description';
    return (await api.patch<UpdateTransactionDescription.Result>(url, command)).data;
  }

  async updateTransactionDate(
    command: UpdateTransactionDate.Command,
  ): Promise<UpdateTransactionDate.Result> {
    const url = this.baseUrl + 'update/transaction-date';
    const response = await api.patch<UpdateTransactionDate.Result>(url, command);
    response.data.data = new Date(response.data.data);
    return response.data;
  }

  async updateTransactionAmount(
    command: UpdateTransactionAmount.Command,
  ): Promise<UpdateTransactionAmount.Result> {
    const url = this.baseUrl + 'update/amount';
    return (await api.patch<UpdateTransactionAmount.Result>(url, command)).data;
  }

  async updateTransactionCategory(
    command: UpdateTransactionCategory.Command,
  ): Promise<UpdateTransactionCategory.Result> {
    const url = this.baseUrl + 'update/budget-category';
    return (await api.patch<UpdateTransactionCategory.Result>(url, command)).data;
  }

  async removeTransaction(command: RemoveTransaction.Command): Promise<RemoveTransaction.Result> {
    const url = this.baseUrl + 'remove';
    return (await api.post<RemoveTransaction.Result>(url, command)).data;
  }

  async getTransactionsDatesRange(
    query: GetTransactionsDatesRange.Query,
  ): Promise<GetTransactionsDatesRange.Result> {
    const url = this.baseUrl + 'get-dates-range';
    const data = await (await api.get<GetTransactionsDatesRange.Result>(url, query)).data;
    if (data.data.maxDate) data.data.maxDate = new Date(data.data.maxDate);
    if (data.data.minDate) data.data.minDate = new Date(data.data.minDate);
    return data;
  }
}

export default new TransactionsApi();
