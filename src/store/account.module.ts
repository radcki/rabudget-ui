import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import Vue from 'vue';
import { RootState } from '.';
import router from '@/router';

export interface UserState {}

const userState: UserState = {};

const actions: ActionTree<UserState, RootState> = {
  async logout({ dispatch }) {
    await dispatch('oidcStore/signOutOidcSilent', {}, { root: true });
    router.push({ name: 'signedOut' });
  },
};

const getters: GetterTree<UserState, RootState> = {};

const mutations: MutationTree<UserState> = {};

export const account: Module<UserState, RootState> = {
  namespaced: true,
  state: userState,
  actions,
  getters,
  mutations,
};
