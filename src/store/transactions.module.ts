import { MutationTree, GetterTree, ActionTree } from 'vuex';
import { RootState } from '.';

export interface TransactionsState {}

export interface LimitCountFilter {
  incomes: number | null;
  savings: number | null;
  spendings: number | null;
}

const transactionsState: TransactionsState = {};

const actions: ActionTree<TransactionsState, RootState> = {};

const getters: GetterTree<TransactionsState, RootState> = {};

const mutations: MutationTree<TransactionsState> = {};

export const transactions = {
  namespaced: true,
  getters,
  state: transactionsState,
  actions,
  mutations,
};
