<template>
  <div>
    <v-list-item :data="category">
      <v-list-item-action class="pa-0 ma-0" style="width: 36px">
        <template v-if="$wait.is(`saving.budgetCategoryOrder${category.budgetCategoryId}`)">
          <v-progress-circular></v-progress-circular>
        </template>
        <template v-else>
          <v-row no-gutters>
            <v-col :cols="12">
              <v-icon v-show="showMoveUp" @click="moveCategoryUp(category)">mdi-chevron-up</v-icon>
            </v-col>
            <v-col :cols="12">
              <v-icon v-show="showMoveDown" @click="moveCategoryDown(category)">
                mdi-chevron-down
              </v-icon>
            </v-col>
          </v-row>
        </template>
      </v-list-item-action>
      <v-list-item-avatar :color="color" size="40" class="mr-4">
        <v-progress-circular
          v-if="
            $wait.is(`saving.category${category.budgetCategoryId}`) || $wait.is(`loading.budget`)
          "
          color="white"
          indeterminate
        ></v-progress-circular>
        <inline-field
          v-model="category.budgetCategoryIconId"
          type="category-icon"
          :loading="$wait.is(`saving.category.icon${category.budgetCategoryId}`)"
          @change="updateCategoryIcon(category)"
        ></inline-field>
        <!-- <v-icon v-else dark size="24">{{ category.budgetCategoryIconKey }}</v-icon> -->
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>
          <inline-field
            v-model="category.name"
            :loading="$wait.is(`saving.category.name${category.budgetCategoryId}`)"
            @change="updateCategoryName(category)"
          ></inline-field>
        </v-list-item-title>
        <v-list-item-subtitle>{{ category.currentBudgetedAmount | money }}</v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-menu :close-on-content-click="false">
          <template #activator="{ on }">
            <icon-button
              :icon="'mdi-chevron-down'"
              :tooltip="$t('budgetCategories.showBudgetedAmounts')"
              v-on="on"
            ></icon-button>
          </template>

          <v-card max-width="500">
            <v-card-text>
              <v-row>
                <v-col v-if="newBudgetAmount" cols="12">
                  <v-row>
                    <v-col class="subtitle-2">
                      {{ $t('budgetCategories.newBudgetedAmount') }}:
                    </v-col>
                    <v-col>
                      <money-field v-model="newBudgetAmount.amount" filled dense></money-field>
                    </v-col>
                    <v-col>
                      <date-field
                        v-model="newBudgetAmount.validFrom"
                        type="month"
                        filled
                        dense
                      ></date-field>
                    </v-col>
                    <v-col class="text-right">
                      <v-btn color="primary" small @click="addBudgetedAmount()">
                        <v-icon left>mdi-plus</v-icon>
                        {{ $t('general.add') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>

                <template>
                  <v-col cols="12">
                    <template v-for="(budgetedAmount, i) in category.budgetedAmounts">
                      <v-row :key="`ba_${i}`" dense>
                        <v-col>
                          <span class="subtitle-2">{{ $t('budgetCategories.validFrom') }}</span>
                          <inline-field
                            v-model="budgetedAmount.validFrom"
                            type="month"
                            :loading="
                              $wait.is(
                                `saving.category.budgetedAmount.validFrom${budgetedAmount.budgetedAmountId}`,
                              )
                            "
                            @change="updateBudgetedAmountValidFrom(budgetedAmount)"
                          ></inline-field>
                        </v-col>
                        <v-col>
                          <span class="subtitle-2">{{
                            $t('budgetCategories.budgetedAmount')
                          }}</span>
                          <inline-field
                            v-model="budgetedAmount.amount"
                            type="money"
                            :loading="
                              $wait.is(
                                `saving.category.budgetedAmount.amount${budgetedAmount.budgetedAmountId}`,
                              )
                            "
                            @change="updateBudgetedAmountAmount(budgetedAmount)"
                          ></inline-field>
                        </v-col>
                        <v-col>
                          <div>
                            <span class="subtitle-2"
                              >{{ $t('budgetCategories.dailyAmount') }}:
                            </span>
                            <nobr>{{ calculateDaily(budgetedAmount.amount) | money }}</nobr>
                          </div>
                          <div>
                            <span class="subtitle-2"
                              >{{ $t('budgetCategories.yearlyAmount') }}:
                            </span>
                            <nobr>{{ calculateYearly(budgetedAmount.amount) | money }}</nobr>
                          </div>
                        </v-col>
                        <v-col class="d-flex flex-grow-0 align-center">
                          <icon-button
                            v-if="showRemoveBudgetedAmountIcon"
                            icon="mdi-close"
                            color="red"
                            :tooltip="$t('general.remove')"
                            @click="removeBudgetedAmount(budgetedAmount)"
                          ></icon-button>
                        </v-col>
                        <v-col cols="12">
                          <v-divider
                            v-if="i < category.budgetedAmounts.length - 1"
                            :key="`dv${i}`"
                          ></v-divider>
                        </v-col>
                      </v-row>
                    </template>
                  </v-col>
                </template>
              </v-row>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-list-item-action>
    </v-list-item>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import {
  BudgetCategoryDto,
  BudgetedAmountDto,
} from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import BudgetCategoriesApi from '@/api/BudgetCategoriesApi';
import { MoneyAmount } from '@/typings/MoneyAmount';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import * as AddBudgetedAmount from '@/typings/api/budgetCategories/AddBudgetedAmount';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    'date-field': () => import('@/components/DateField.vue'),
    'money-field': () => import('@/components/MoneyField.vue'),
  },
})
export default class CategoriesListItem extends Vue {
  @Prop(String) color?: string;
  @Prop(String) colorSecondary?: string;
  @Prop(Boolean) hideActions?: boolean;
  @Prop(Boolean) showMoveUp?: boolean;
  @Prop(Boolean) showMoveDown?: boolean;
  @Prop(Object) category!: BudgetCategoryDto;

  budgetedAmountsVisible = false;
  newBudgetAmount: AddBudgetedAmount.Command = null;

  toggleBudgetedAmounts() {
    this.budgetedAmountsVisible = !this.budgetedAmountsVisible;
  }
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget | null;

  get orderedBudgetedAmounts() {
    return this.category.budgetedAmounts.sort(
      (a, b) => a.validFrom.valueOf() - b.validFrom.valueOf(),
    );
  }

  generateNewBudgetAmount(): AddBudgetedAmount.Command | null {
    return {
      validFrom: new Date(),
      amount: {
        currencyCode: this.activeBudget.currency.currencyCode,
        amount: 0,
      },
      budgetCategoryId: this.category.budgetCategoryId,
    };
  }

  mounted() {
    this.newBudgetAmount = this.generateNewBudgetAmount();
  }

  async moveCategoryUp(category: BudgetCategoryDto) {
    this.$wait.start(`saving.budgetCategoryOrder${category.budgetCategoryId}`);
    try {
      await BudgetCategoriesApi.moveBudgetCategoryUp(category);
      this.$emit('order-changed');
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
      this.$emit('order-changed');
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.budgetCategoryOrder${category.budgetCategoryId}`);
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

  get showRemoveBudgetedAmountIcon() {
    return this.category.budgetedAmounts.length > 1;
  }

  calculateYearly(amount: MoneyAmount): MoneyAmount {
    return {
      currencyCode: amount.currencyCode,
      amount: amount.amount * 12,
    };
  }

  calculateDaily(amount: MoneyAmount): MoneyAmount {
    return {
      currencyCode: amount.currencyCode,
      amount: (amount.amount * 12) / 365,
    };
  }

  async addBudgetedAmount() {
    this.$wait.start(`saving.category.budgetedAmount`);
    try {
      const response = await BudgetCategoriesApi.addBudgetedAmount(this.newBudgetAmount);
      Object.assign(this.category, response.data);
      this.newBudgetAmount = this.generateNewBudgetAmount();
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.category.budgetedAmount`);
    }
  }

  async updateBudgetedAmountValidFrom(budgetedAmount: BudgetedAmountDto) {
    this.$wait.start(`saving.category.budgetedAmount.validFrom${budgetedAmount.budgetedAmountId}`);
    try {
      const response = await BudgetCategoriesApi.updateBudgetedAmountValidFrom({
        budgetedAmountId: budgetedAmount.budgetedAmountId,
        validFrom: budgetedAmount.validFrom,
      });
      Object.assign(this.category, response.data);
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.category.budgetedAmount.validFrom${budgetedAmount.budgetedAmountId}`);
    }
  }

  async removeBudgetedAmount(budgetedAmount: BudgetedAmountDto) {
    const confirmed = await this.$msgBox.confirm(
      this.$t('budgetCategories.budgetedAmountDeleteTitle').toString(),
      this.$t('budgetCategories.budgetedAmountDeleteMessage').toString(),
    );
    if (!confirmed) {
      return;
    }

    this.$wait.start(`removing.category.budgetedAmount${budgetedAmount.budgetedAmountId}`);
    try {
      const response = await BudgetCategoriesApi.removeBudgetedAmount({
        budgetedAmountId: budgetedAmount.budgetedAmountId,
      });
      Object.assign(this.category, response.data);
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`removing.category.budgetedAmount${budgetedAmount.budgetedAmountId}`);
    }
  }

  async updateBudgetedAmountAmount(budgetedAmount: BudgetedAmountDto) {
    this.$wait.start(`saving.category.budgetedAmount.amount${budgetedAmount.budgetedAmountId}`);
    try {
      const response = await BudgetCategoriesApi.updateBudgetedAmountAmount({
        budgetedAmountId: budgetedAmount.budgetedAmountId,
        amount: budgetedAmount.amount,
      });
      Object.assign(this.category, response.data);
    } catch (error) {
      this.$msgBox.apiError(error);
    } finally {
      this.$wait.end(`saving.category.budgetedAmount.amount${budgetedAmount.budgetedAmountId}`);
    }
  }
}
</script>
