<template>
  <v-container>
    <v-row>
      <v-col>
        <v-subheader class="headline white--text">{{ $t('budgetCategories.title') }}</v-subheader>
      </v-col>
    </v-row>
    <v-row class="mt-1">
      <v-col>
        <categories-list
          color="spending"
          :title="$t('budgetCategories.spending')"
          :category-type="budgetCategoryTypes.Spending"
        ></categories-list>
      </v-col>
      <v-col>
        <categories-list
          color="income"
          :title="$t('budgetCategories.income')"
          :category-type="budgetCategoryTypes.Income"
        ></categories-list
      ></v-col>
      <v-col>
        <categories-list
          color="saving"
          :title="$t('budgetCategories.saving')"
          :category-type="budgetCategoryTypes.Saving"
        ></categories-list
      ></v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Currency } from '@/typings/Currency';
import { namespace } from 'vuex-class';
import CategoriesList from './components/CategoriesList.vue';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';

const dictionaries = namespace('dictionaries');
const budgetsStore = namespace('budgets');

@Component({
  components: {
    CategoriesList,
  },
})
export default class BudgetCategories extends Vue {
  budgetCategoryTypes = eBudgetCategoryType;

  @dictionaries.State('currencies') currencies?: Currency[];
  @budgetsStore.Action('loadBudgets') loadBudgets!: () => Promise<void>;

  mounted() {
    //
  }
}
</script>
