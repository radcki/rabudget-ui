<template>
  <v-card>
    <v-card-title :class="`${color} my-0 py-0`">
      <v-subheader dark>
        {{ title }}
      </v-subheader>
      <v-spacer></v-spacer>
      <icon-button
        icon="mdi-plus-circle-outline"
        :tooltip="$t('budgetCategories.create')"
        color="white"
        :loading="categoryIsCreating"
        @click="createCategory()"
      ></icon-button>
      <v-chip color="rgba(0,0,0,0.15)" text-color="white">
        {{ budgetedAmountSum | money }}
      </v-chip>
    </v-card-title>
    <v-card-text class="px-0 py-1">
      <v-list subheader>
        <template v-for="(category, i) in categories">
          <categories-list-item
            :key="`ctg${i}`"
            :color="color"
            :category="category"
            :show-move-down="i != categories.length - 1"
            :show-move-up="i != 0"
            @order-changed="fetchBudgetCategories()"
            @category-removed="fetchBudgetCategories()"
          ></categories-list-item>
        </template>
      </v-list>
      <div v-if="showNoData" class="text-center pa-3 pb-5">
        <h3>{{ $t('budgetCategories.noCategories') }}</h3>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
//import { startOfMonth } from 'date-fns';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
//import * as BudgetCategoryList from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';
import * as CreateBudgetCategory from '@/typings/api/budgetCategories/CreateBudgetCategory';
import { MoneyAmount } from '@/typings/MoneyAmount';
import BudgetCategoryEditor from '@/modals/BudgetCategoryEditor.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'categories-list-item': () => import('./CategoriesListItem.vue'),
  },
})
export default class CategoriesList extends Vue {
  @Prop(String) title?: string;
  @Prop(String) color?: string;
  @Prop(String) colorSecondary?: string;
  @Prop(Boolean) hideActions?: boolean;
  @Prop(Number) categoryType?: eBudgetCategoryType;

  categories: BudgetCategoryDto[] = [];

  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;
  get showNoData() {
    return this.categories.length == 0;
  }

  get isLoading() {
    return this.$wait.is(`loading.budgetCategories${this.categoryType}`);
  }

  get budgetedAmountSum(): MoneyAmount {
    return {
      currencyCode: this.activeBudget ? this.activeBudget.currency.currencyCode : null,
      amount: this.categories
        .filter(v => !!v && !!v.currentBudgetedAmount)
        .map(v => v.currentBudgetedAmount.amount)
        .reduce((a, b) => a + b, 0),
    };
  }

  get categoryIsCreating(): boolean {
    return this.$wait.is(`saving.newBudgetCategory`);
  }

  async moveCategoryUp(category: BudgetCategoryDto) {
    this.$wait.start(`saving.budgetCategoryOrder${category.budgetCategoryId}`);
    try {
      await BudgetCategoriesApi.moveBudgetCategoryUp(category);
      this.fetchBudgetCategories();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.budgetCategoryOrder${category.budgetCategoryId}`);
    }
  }

  async moveCategoryDown(category: BudgetCategoryDto) {
    this.$wait.start(`saving.budgetCategoryOrder${category.budgetCategoryId}`);
    try {
      await BudgetCategoriesApi.moveBudgetCategoryDown(category);
      this.fetchBudgetCategories();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.budgetCategoryOrder${category.budgetCategoryId}`);
    }
  }

  emitSave(payload) {
    this.$emit('edit', payload);
  }
  async createCategory() {
    let category: CreateBudgetCategory.Command = {
      budgetId: this.activeBudget.budgetId,
      name: '',
      budgetCategoryIconId: '',
      budgetCategoryType: this.categoryType,
      budgetedAmounts: [
        {
          amount: {
            currencyCode: this.activeBudget.currency.currencyCode,
            amount: 0,
          },
          validFrom: new Date(),
        },
      ],
    };

    category = await this.$modal.open(BudgetCategoryEditor, category, {
      title: this.$t('budgetCategories.create').toString(),
    });
    if (!category) {
      return;
    }
    this.$wait.start(`saving.newBudgetCategory`);
    try {
      await BudgetCategoriesApi.createBudgetCategory(category);
      this.fetchBudgetCategories();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.newBudgetCategory`);
    }
  }

  async updateCategoryName(category: BudgetCategoryDto) {
    this.$wait.start(`saving.category.name${category.budgetCategoryId}`);
    try {
      const response = await BudgetCategoriesApi.updateBudgetCategoryName({
        budgetCategoryId: category.budgetCategoryId,
        name: category.name,
      });
      category.name = response.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.category.name${category.budgetCategoryId}`);
    }
  }

  async updateCategoryIcon(category: BudgetCategoryDto) {
    this.$wait.start(`saving.category.icon${category.budgetCategoryId}`);
    try {
      const response = await BudgetCategoriesApi.updateBudgetCategoryIcon({
        budgetCategoryId: category.budgetCategoryId,
        budgetCategoryIconId: category.budgetCategoryIconId,
      });
      category.budgetCategoryIconId = response.data.iconId;
      category.budgetCategoryIconKey = response.data.iconKey;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.category.icon${category.budgetCategoryId}`);
    }
  }

  async editCategory(category: BudgetCategoryDto) {
    category = await this.$modal.open(BudgetCategoryEditor, category, {
      title: this.$t('budgetCategories.create').toString(),
    });
    if (!category) {
      return;
    }
  }

  async fetchBudgetCategories() {
    this.$wait.start(`loading.budgetCategories${this.categoryType}`);
    try {
      const data = await BudgetCategoriesApi.getBudgetsCategoriesList({
        budgetId: this.activeBudget.budgetId,
        budgetCategoryTypes: [this.categoryType],
        includeHidden: true,
      });
      this.categories = data.data;
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`loading.budgetCategories${this.categoryType}`);
    }
  }

  mounted() {
    if (this.activeBudget) {
      this.fetchBudgetCategories();
    }
  }

  @Watch('activeBudget')
  onActiveBudgetChange() {
    this.fetchBudgetCategories();
  }
}
</script>
