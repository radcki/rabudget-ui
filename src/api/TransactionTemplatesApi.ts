import api from './ApiService';
import * as CreateTransactionTemplate from '@/typings/api/transactionTemplates/CreateTransactionTemplate';
import * as GetTransactionTemplateList from '@/typings/api/transactionTemplates/GetTransactionTemplateList';
import * as UpdateTransactionTemplateDescription from '@/typings/api/transactionTemplates/UpdateTransactionTemplateDescription';
import * as UpdateTransactionTemplateAmount from '@/typings/api/transactionTemplates/UpdateTransactionTemplateAmount';
import * as RemoveTransactionTemplate from '@/typings/api/transactionTemplates/RemoveTransactionTemplate';
import * as UpdateTransactionTemplateCategory from '@/typings/api/transactionTemplates/UpdateTransactionTemplateCategory';

class TransactionTemplatesApi {
  private baseUrl = 'transaction-template/';
  async isAlive() {
    const url = this.baseUrl + 'is-alive';
    return await api.get(url, null);
  }
  async getTransactionTemplateList(
    query: GetTransactionTemplateList.Query,
  ): Promise<GetTransactionTemplateList.Result> {
    const url = this.baseUrl + 'get-list';
    const data = await (await api.get<GetTransactionTemplateList.Result>(url, query)).data;
    return data;
  }

  async createTransactionTemplate(
    command: CreateTransactionTemplate.Command,
  ): Promise<CreateTransactionTemplate.Result> {
    const url = this.baseUrl + 'create';
    return (await api.post<CreateTransactionTemplate.Result>(url, command)).data;
  }

  async updateTransactionTemplateDescription(
    command: UpdateTransactionTemplateDescription.Command,
  ): Promise<UpdateTransactionTemplateDescription.Result> {
    const url = this.baseUrl + 'update/description';
    return (await api.patch<UpdateTransactionTemplateDescription.Result>(url, command)).data;
  }

  async updateTransactionTemplateAmount(
    command: UpdateTransactionTemplateAmount.Command,
  ): Promise<UpdateTransactionTemplateAmount.Result> {
    const url = this.baseUrl + 'update/amount';
    return (await api.patch<UpdateTransactionTemplateAmount.Result>(url, command)).data;
  }

  async updateTransactionTemplateCategory(
    command: UpdateTransactionTemplateCategory.Command,
  ): Promise<UpdateTransactionTemplateCategory.Result> {
    const url = this.baseUrl + 'update/budget-category';
    return (await api.patch<UpdateTransactionTemplateCategory.Result>(url, command)).data;
  }

  async removeTransactionTemplate(
    command: RemoveTransactionTemplate.Command,
  ): Promise<RemoveTransactionTemplate.Result> {
    const url = this.baseUrl + 'remove';
    return (await api.post<RemoveTransactionTemplate.Result>(url, command)).data;
  }
}

export default new TransactionTemplatesApi();
