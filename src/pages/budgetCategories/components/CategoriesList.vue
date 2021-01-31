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
        <v-list-item v-for="(category, i) in categories" :key="i" :data="category">
          <v-list-item-action class="pa-0 ma-0" style="width: 36px">
            <template v-if="$wait.is(`saving.budgetCategoryOrder${category.budgetCategoryId}`)">
              <v-progress-circular></v-progress-circular>
            </template>
            <template v-else>
              <v-row no-gutters>
                <v-col :cols="12">
                  <v-icon v-show="i != 0" @click="moveCategoryUp(category)">mdi-chevron-up</v-icon>
                </v-col>
                <v-col :cols="12">
                  <v-icon v-show="i != categories.length - 1" @click="moveCategoryDown(category)">
                    mdi-chevron-down
                  </v-icon>
                </v-col>
              </v-row>
            </template>
          </v-list-item-action>
          <v-list-item-avatar :color="color" size="40" class="mr-4">
            <v-progress-circular
              v-if="
                $wait.is(`saving.category${category.budgetCategoryId}`) ||
                $wait.is(`loading.budget`)
              "
              color="white"
              indeterminate
            ></v-progress-circular>
            <v-icon v-else dark size="24">{{ category.budgetCategoryIconKey }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ category.name }}</v-list-item-title>
            <v-list-item-subtitle>{{
              category.currentBudgetedAmount | money
            }}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action v-if="!hideActions">
            <v-menu ref="menu" :left="!$vuetify.breakpoint.smAndUp" nudge-bottom="42">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list light dense single-line>
                <v-list-item @click="editCategory(category)">
                  <v-list-item-action class="mr-0 pr-5">
                    <v-icon color="primary">mdi-pencil</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>
                    {{ $t('budgetCategories.edit') }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item @click="$emit('transfer', category)">
                  <v-list-item-action class="mr-0 pr-5">
                    <v-icon color="purple">mdi-reply-all</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{
                    $t('budgetCategories.transactionsTransfer')
                  }}</v-list-item-title>
                </v-list-item>

                <v-list-item @click="$emit('delete', category)">
                  <v-list-item-action class="mr-0 pr-5">
                    <v-icon color="red">mdi-trash-can</v-icon>
                  </v-list-item-action>
                  <v-list-item-title>{{ $t('budgetCategories.remove') }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
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
import IconButton from '@/components/IconButton.vue';
import * as CreateBudgetCategory from '@/typings/api/budgetCategories/CreateBudgetCategory';
import { MoneyAmount } from '@/typings/MoneyAmount';
import BudgetCategoryEditor from '@/modals/BudgetCategoryEditor.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    IconButton,
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

  get isLoadgin() {
    return this.$wait.is(`loading.budgetCategories${this.categoryType}`);
  }

  get budgetedAmountSum(): MoneyAmount {
    return {
      currencyCode: this.activeBudget ? this.activeBudget.currency.currencyCode : null,
      amount: this.categories.map(v => v.currentBudgetedAmount.amount).reduce((a, b) => a + b, 0),
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

  async editCategory(category: BudgetCategoryDto) {
    category = await this.$modal.open(BudgetCategoryEditor, category, {
      title: this.$t('budgetCategories.create').toString(),
    });
    if (!category) {
      return;
    }
    console.log(category);
  }

  async fetchBudgetCategories() {
    this.$wait.start(`loading.budgetCategories${this.categoryType}`);
    try {
      const data = await BudgetCategoriesApi.getBudgetsCategoriesList({
        budgetId: this.activeBudget.budgetId,
        budgetCategoryTypes: [this.categoryType],
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
