import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import Vue from 'vue';
import { RootState } from '.';

export interface UserState {}

const userState: UserState = {};

const actions: ActionTree<UserState, RootState> = {
  logout() {
    //Vue.prototype.$keycloak.logoutFn();
  },
};

const getters: GetterTree<UserState, RootState> = {
  currentUser(): any | null {
    return null;
  },
};

const mutations: MutationTree<UserState> = {};

export const account: Module<UserState, RootState> = {
  namespaced: true,
  state: userState,
  actions,
  getters,
  mutations,
};
