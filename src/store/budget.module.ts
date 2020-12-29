import { RootState } from '.';
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import BudgetApi from '@/api/BudgetApi';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';

export interface BudgetState {
  budgets: Budget[];
  activeBudgetId: string | null;
  activeBudgetCategories: BudgetCategoryDto[];
}

export const stateData: BudgetState = {
  budgets: [],
  activeBudgetId: null,
  activeBudgetCategories: [],
};

const actions: ActionTree<BudgetState, RootState> = {
  async loadBudgets({ commit, dispatch, state }) {
    dispatch('wait/start', 'loading.budgets', { root: true });
    try {
      const response = await BudgetApi.getBudgetsList({});
      commit('setBudgets', response.data);
      if (response.data.length > 0 && !state.activeBudgetId) {
        await dispatch('autoSetActiveBudget');
      }
    } catch (error) {
      console.error(error);
    } finally {
      dispatch('wait/end', 'loading.budgets', { root: true });
    }
  },

  async autoSetActiveBudget({ state, dispatch }) {
    const budgetToSet = state.budgets.length > 0 ? state.budgets[0] : null;
    await dispatch('setActiveBudget', budgetToSet);
  },

  async setActiveBudget({ state, dispatch, commit }, budget: Budget) {
    const previousId = state.activeBudgetId;
    commit('setActive', budget);
    if (state.activeBudgetId != previousId) {
      dispatch('loadActiveBudgetCategories');
    }
  },

  async loadActiveBudgetCategories({ commit, dispatch, state }) {
    dispatch('wait/start', 'loading.activeBudgetCategories', { root: true });
    try {
      if (!state.activeBudgetId) {
        return;
      }
      const response = await BudgetCategoriesApi.getBudgetsCategoriesList({
        budgetId: state.activeBudgetId,
      });
      commit('setActiveBudgetCategories', response.data);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch('wait/end', 'loading.activeBudgetCategories', { root: true });
    }
  },
};

const getters: GetterTree<BudgetState, RootState> = {
  activeBudget(state) {
    return state.activeBudgetId
      ? state.budgets.find(v => v.budgetId == state.activeBudgetId)
      : null;
  },
  activeBudgetCategories(state) {
    return state.activeBudgetCategories || [];
  },
};

const mutations: MutationTree<BudgetState> = {
  setBudgets(state, payload: Budget[]) {
    state.budgets = payload;
  },
  setActive(state, payload: Budget) {
    console.log('setActive', payload);
    state.activeBudgetId = payload ? payload.budgetId : null;
  },
  setActiveBudgetCategories(state, payload: BudgetCategoryDto[]) {
    state.activeBudgetCategories = payload;
  },
};

export const budget: Module<BudgetState, RootState> = {
  namespaced: true,
  state: stateData,
  getters,
  actions,
  mutations,
};
