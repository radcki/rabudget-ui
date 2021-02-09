import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { RootState } from '.';
import { vuexOidcCreateUserManager } from 'vuex-oidc';
import oidcSettings from '@/auth';
const userManager = vuexOidcCreateUserManager(oidcSettings);

export interface UserState {
  accountManagementUrl: string;
}

const userState: UserState = {
  accountManagementUrl: '',
};

const actions: ActionTree<UserState, RootState> = {
  async logout({ dispatch }) {
    await dispatch('oidcStore/signOutOidc', {}, { root: true });
  },

  async init({ commit }) {
    const metadataService = userManager.metadataService;
    const metadata = await metadataService.getMetadata();
    commit('setAccountManagementUrl', metadata['account_management_endpoint']);
  },
};

const getters: GetterTree<UserState, RootState> = {
  accountManagementUrl(state): string {
    return state.accountManagementUrl;
  },
};

const mutations: MutationTree<UserState> = {
  setAccountManagementUrl(state, payload: string) {
    state.accountManagementUrl = payload;
  },
};

export const account: Module<UserState, RootState> = {
  namespaced: true,
  state: userState,
  actions,
  getters,
  mutations,
};
