import { RootState } from '.';
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import BudgetApi from '@/api/BudgetApi';

export interface BudgetState {
  budgets: Budget[];
  activeBudgetId: string | null;
}

export const stateData: BudgetState = {
  budgets: [],
  activeBudgetId: null,
};

const actions: ActionTree<BudgetState, RootState> = {
  async loadBudgets({ commit, dispatch, state }) {
    dispatch('wait/start', 'loading.budgets', { root: true });
    try {
      const response = await BudgetApi.getBudgetsList({});
      commit('setBudgets', response.data);
      if (response.data.length > 0 && !state.activeBudgetId) {
        commit('autoSetActive');
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch('wait/end', 'loading.budgets', { root: true });
    }
  },
};

const getters: GetterTree<BudgetState, RootState> = {
  activeBudget(state) {
    return state.activeBudgetId
      ? state.budgets.find(v => v.budgetId == state.activeBudgetId)
      : null;
  },
};

const mutations: MutationTree<BudgetState> = {
  setBudgets(state, payload: Budget[]) {
    state.budgets = payload;
  },
  setActive(state, payload: Budget) {
    state.activeBudgetId = payload ? payload.budgetId : null;
  },
  autoSetActive(state) {
    state.activeBudgetId = state.budgets.length > 0 ? state.budgets[0].budgetId : null;
  },
};

export const budget: Module<BudgetState, RootState> = {
  namespaced: true,
  state: stateData,
  getters,
  actions,
  mutations,
};
