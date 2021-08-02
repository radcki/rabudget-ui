import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { vuexOidcCreateStoreModule } from 'vuex-oidc';
import { vuexOidcCreateUserManager } from 'vuex-oidc';

import oidcSettings from '@/auth';

import { budget } from './budget.module';
import { account } from './account.module';
import { dictionaries } from './dictionaries.module';
import api from '@/api/ApiService';
import signalrPlugin from '@/plugins/signalr';

Vue.use(Vuex);
// tslint:disable-next-line: no-empty-interface
export interface RootState {}

const store: StoreOptions<RootState> = {
  actions: {
    init({ dispatch }) {
      dispatch('dictionaries/loadCurrencies');
      dispatch('dictionaries/loadCategoryIcons');
      dispatch('budgets/loadBudgets');
      dispatch('account/init');
    },
  },
  modules: {
    account,
    budgets: budget,
    dictionaries,
    oidcStore: vuexOidcCreateStoreModule(
      oidcSettings,
      {
        namespaced: true,
        dispatchEventsOnWindow: true,
      },
      {
        userLoaded: user => {
          // console.log('OIDC user is loaded:', user);
          api.setInterceptor(vuexOidcCreateUserManager(oidcSettings));
          signalrPlugin.setToken(user.access_token);
        },
        userUnloaded: () => console.log('OIDC user is unloaded'),
        accessTokenExpiring: () => {
          console.log('Access token will expire');
        },
        accessTokenExpired: () => {
          console.log('Access token did expire');
        },
        silentRenewError: () => console.log('OIDC user is unloaded - silentRenewError'),
        userSignedOut: () => console.log('OIDC user is signed out'),
        oidcError: payload => console.log('OIDC error', payload),
        automaticSilentRenewError: payload =>
          console.log('OIDC automaticSilentRenewError', payload),
      },
    ),
  },
};

export default new Vuex.Store<RootState>(store);
