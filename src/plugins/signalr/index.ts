import * as signalR from '@aspnet/signalr';
import { VueConstructor } from 'vue/types/umd';

export interface NotificationHub {
  setup: (token: string) => void;
  on: (key: string, handler: (payload: any) => void) => void;
  off: (key: string, handler: (payload: any) => void) => void;
  emit: (key: string, payload) => void;
}

export const BalanceNotificationEvents = {
  TotalBalanceChanged: 'TOTAL_BALANCE_CHANGED',
  BudgetCategoryBalanceChanged: 'BUDGET_CATEGORY_BALANCE_CHANGED',
};

export const TransactionNotificationEvents = {
  TransactionListChanged: 'TRANSACTION_LIST_CHANGED',
  TransactionUpdated: 'TRANSACTION_UPDATED',
};
export const AllocationNotificationEvents = {
  AllocationListChanged: 'ALLOCATION_LIST_CHANGED',
  AllocationUpdated: 'ALLOCATION_UPDATED',
};

class SignalrPlugin {
  *enumKeys(obj) {
    for (const key in obj) {
      yield obj[key] as string;
    }
  }

  balanceNotificationsHubConnection: signalR.HubConnection = null;
  transactionNotificationsHubConnection: signalR.HubConnection = null;

  token: string | null = null;

  install(Vue: VueConstructor) {
    let notificationHub = new Vue();
    this.balanceNotificationsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/balance-notifications`, {
        accessTokenFactory: () => {
          return this.token;
        },
      })
      .build();

    this.transactionNotificationsHubConnection = new signalR.HubConnectionBuilder()
      .configureLogging(signalR.LogLevel.Warning)
      .withUrl(`${process.env.VUE_APP_APIURL}/hubs/transaction-notifications`, {
        accessTokenFactory: () => {
          return this.token;
        },
      })
      .build();

    if (this.token) {
      this.balanceNotificationsHubConnection.start();
      this.transactionNotificationsHubConnection.start();
    }

    for (const key of this.enumKeys(BalanceNotificationEvents)) {
      this.balanceNotificationsHubConnection.on(key, payload => {
        notificationHub.$emit(key, payload);
      });
    }
    for (const key of this.enumKeys(TransactionNotificationEvents)) {
      this.transactionNotificationsHubConnection.on(key, payload => {
        notificationHub.$emit(key, payload);
      });
    }
    Object.defineProperties(notificationHub, {
      on: {
        get() {
          return this.$on.bind(this);
        },
      },
      off: {
        get() {
          return this.$off.bind(this);
        },
      },
      emit: {
        get() {
          return this.$emit.bind(this);
        },
      },
    });
    notificationHub = Object.assign(notificationHub, { setToken: this.setToken });

    Vue.prototype.$notificationHub = notificationHub;
  }

  async setToken(token: string) {
    this.token = token;
    await this.balanceNotificationsHubConnection.stop();
    await this.transactionNotificationsHubConnection.stop();
    await this.balanceNotificationsHubConnection.start();
    await this.transactionNotificationsHubConnection.start();
  }
}

const signalrPlugin = new SignalrPlugin();

export default signalrPlugin;
