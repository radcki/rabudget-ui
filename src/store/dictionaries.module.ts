import { RootState } from '.';
import { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import { Currency } from '@/typings/Currency';
import { BudgetCategoryIconDto } from '@/typings/api/dictionaries/GetBudgetCategoryIcons';
import DictionariesApi from '@/api/DictionariesApi';

export interface DictionariesState {
  currencies: Currency[];
  budgetCategoryIcons: BudgetCategoryIconDto[];
}

export const stateData: DictionariesState = {
  currencies: [],
  budgetCategoryIcons: [],
};

const actions: ActionTree<DictionariesState, RootState> = {
  async loadCurrencies({ commit, dispatch }) {
    dispatch('wait/start', 'loading.currencies', { root: true });
    try {
      const response = await DictionariesApi.getCurrencies({});
      commit('setCurrencies', response.data);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch('wait/end', 'loading.currencies', { root: true });
    }
  },
  async loadCategoryIcons({ commit, dispatch }) {
    dispatch('wait/start', 'loading.categoryIcons', { root: true });
    try {
      const response = await DictionariesApi.getBudgetCategoryIcons({});
      commit('setCategoryIcons', response.data);
    } catch (error) {
      console.error(error);
    } finally {
      dispatch('wait/end', 'loading.categoryIcons', { root: true });
    }
  },
};

const getters: GetterTree<DictionariesState, RootState> = {};

const mutations: MutationTree<DictionariesState> = {
  setCurrencies(state, payload: Currency[]) {
    state.currencies = payload;
  },
  setCategoryIcons(state, payload: BudgetCategoryIconDto[]) {
    state.budgetCategoryIcons = payload;
  },
};

export const dictionaries: Module<DictionariesState, RootState> = {
  namespaced: true,
  state: stateData,
  getters,
  actions,
  mutations,
};
