import { FieldOrderInfo } from '@/typings/api/baseTypes/GridQuery';
import axios from 'axios';
import { User } from 'oidc-client';

class ApiService {
  private baseUrl = `${process.env.VUE_APP_APIURL}/`;

  setInterceptor(user: User) {
    axios.interceptors.request.use(function (config) {
      config.headers.Authorization =
        user && user.access_token ? `Bearer ${user.access_token}` : null;
      return config;
    });
    console.log('setInterceptor');
  }

  async get<T = any>(url: string, query?: any) {
    if (query) {
      const params: string[] = [];
      for (const key in query) {
        if (Array.isArray(query[key])) {
          for (const value of query[key]) {
            if (key == 'dataOrder') {
              const dataOrderValue = value as FieldOrderInfo<string>;
              params.push(
                `${key}=${dataOrderValue.descending ? '-' : '+'}${dataOrderValue.fieldName}`,
              );
            } else {
              params.push(`${key}=${this.ToString(value)}`);
            }
          }
        } else if (query[key]) {
          params.push(`${key}=${this.ToString(query[key])}`);
        }
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
    }
    return await axios.get<T>(this.baseUrl + url);
  }

  async post<T = any>(url: string, data: any) {
    return await axios.post<T>(this.baseUrl + url, data || {});
  }

  async patch<T = any>(url: string, data: any) {
    return await axios.patch<T>(this.baseUrl + url, data || {});
  }

  private ToString(value: any) {
    if (value instanceof Date) {
      return value.toJSON();
    }
    return value.toString();
  }
}

const api = new ApiService();

export default api;
