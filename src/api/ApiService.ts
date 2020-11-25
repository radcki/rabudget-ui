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
    return await axios.get<T>(this.baseUrl + url);
  }

  async post<T = any>(url: string, data: any) {
    return await axios.post<T>(this.baseUrl + url, data || {});
  }

  async patch<T = any>(url: string, data: any) {
    return await axios.patch<T>(this.baseUrl + url, data || {});
  }
}

const api = new ApiService();

export default api;
