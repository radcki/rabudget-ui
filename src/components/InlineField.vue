<template>
  <div class="inline-field">
    <template v-if="!editMode">
      <template v-if="type == 'text'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue }}</div>
      </template>

      <template v-if="type == 'date'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue | shortDate }}</div>
      </template>

      <template v-if="type == 'month'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue | monthDate }}</div>
      </template>

      <template v-if="type == 'money'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue | money }}</div>
      </template>

      <template v-if="type == 'category'">
        <v-menu nudge-bottom="30">
          <template #activator="{ on }">
            <div class="inline-field--display text-left" v-on="on">
              <template v-if="budgetCategory">
                <v-icon
                  :left="!hideCategoryName"
                  :color="categoryColor(budgetCategory.budgetCategoryId)"
                  >{{ budgetCategory.budgetCategoryIconKey }}</v-icon
                >
                <span v-if="!hideCategoryName">
                  {{ budgetCategory.name }}
                </span>
              </template>
              <template v-else> - </template>
            </div>
          </template>
          <v-list dense max-height="300" style="overflow: auto">
            <v-list-item
              v-for="(item, itemIndex) in budgetCategories"
              :key="`ii_${itemIndex}`"
              @click="selectCategory(item)"
            >
              <v-icon
                left
                :color="
                  budgetCategory && budgetCategory.budgetCategoryId == item.budgetCategoryId
                    ? categoryColor(budgetCategory.budgetCategoryId)
                    : ''
                "
              >
                {{ item.budgetCategoryIconKey }}
              </v-icon>
              {{ item.name }}
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-if="type == 'category-icon'">
        <template v-if="loading && type == 'category-icon'">
          <v-progress-circular
            size="24"
            color="white"
            class="mr-1 mt-1"
            width="4"
            indeterminate
          ></v-progress-circular>
        </template>
        <v-menu v-else max-height="300" bottom close-on-click>
          <template #activator="{ on }">
            <div class="inline-select--display text-center" v-on="on">
              <v-icon v-if="innerValue" color="white">{{ iconKey }}</v-icon>
              <div v-else class="d-block" style="min-width: 20px; min-height: 20px">&nbsp;</div>
            </div>
          </template>
          <v-list>
            <v-list-item
              v-for="(icon, index) in budgetCategoryIcons"
              :key="index"
              @click="setIcon(icon.budgetCategoryIconId)"
            >
              <v-icon>{{ icon.iconKey }}</v-icon>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </template>
    <template v-if="loading && type != 'category-icon'">
      <v-progress-circular
        size="10"
        class="ml-1 mt-1"
        width="2"
        indeterminate
      ></v-progress-circular>
    </template>
    <template v-if="editMode">
      <template v-if="type == 'text'">
        <v-text-field
          ref="textEditor"
          v-model="innerValue"
          class="inline-field--editor"
          dense
          hide-details
          filled
          append-icon="mdi-close"
          @keyup.enter="finishEdit()"
          @keyup.esc="cancelEdit"
          @click:append="cancelEdit"
          @blur="finishEdit()"
        ></v-text-field>
      </template>
      <template v-if="type == 'date'">
        <div class="inline-field--editor">
          <date-field
            ref="textEditor"
            v-model="innerValue"
            dense
            hide-details
            filled
            disable-input
            append-icon="mdi-close"
            @keyup.enter="finishEdit()"
            @keyup.esc="cancelEdit"
            @click:append="cancelEdit"
            @change="finishEdit()"
          ></date-field>
        </div>
      </template>
      <template v-if="type == 'month'">
        <div class="inline-field--editor">
          <date-field
            ref="textEditor"
            v-model="innerValue"
            dense
            hide-details
            filled
            type="month"
            disable-input
            append-icon="mdi-close"
            @keyup.enter="finishEdit()"
            @keyup.esc="cancelEdit"
            @click:append="cancelEdit"
            @change="finishEdit()"
          ></date-field>
        </div>
      </template>
      <template v-if="type == 'money'">
        <div class="inline-field--editor">
          <money-field
            ref="textEditor"
            v-model="innerValue"
            dense
            hide-details
            filled
            append-icon="mdi-close"
            @keyup.enter="finishEdit()"
            @keyup.esc="cancelEdit"
            @click:append="cancelEdit"
            @blur="finishEdit()"
          ></money-field>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { BudgetCategoryIconDto } from '@/typings/api/dictionaries/GetBudgetCategoryIcons';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DateField from './DateField.vue';
import MoneyField from './MoneyField.vue';
import CategoryIconSelect from './CategoryIconSelect.vue';

const budgetsStore = namespace('budgets');
const dictionaries = namespace('dictionaries');

@Component({
  components: {
    DateField,
    MoneyField,
    CategoryIconSelect,
  },
})
export default class InlineField extends Vue {
  @Prop({ type: [String, Date, Number, Object] }) value!: Date | string | number;
  @Prop(Boolean) loading!: boolean;
  @Prop({ type: String, default: 'text' }) type!:
    | 'text'
    | 'category'
    | 'date'
    | 'month'
    | 'money'
    | 'category-icon';
  @Prop({ type: Number, required: false }) categoryType!: eBudgetCategoryType | null;
  @Prop(Boolean) hideCategoryName!: boolean;
  @Prop(Boolean) clearable!: boolean;

  innerValue = this.value || null;
  initialValue = this.value ? JSON.parse(JSON.stringify(this.value)) : null;
  editMode = false;
  timeout: null | any = null;

  created() {
    this.innerValue = this.value;
    this.initialValue = JSON.parse(JSON.stringify(this.value));
  }

  @dictionaries.State('budgetCategoryIcons') budgetCategoryIcons?: BudgetCategoryIconDto[];
  @budgetsStore.Getter('activeBudgetCategories') allBudgetCategories!: BudgetCategoryDto[];

  get budgetCategory() {
    if (this.type == 'category' && this.innerValue) {
      return this.getBudgetCategory(this.innerValue.toString());
    }
    return null;
  }

  get budgetCategories() {
    if (this.categoryType == null) {
      return [];
    }
    return this.allBudgetCategories.filter(v => v.budgetCategoryType == this.categoryType);
  }

  getBudgetCategory(budgetCategoryId: string) {
    return this.budgetCategories.find(v => v.budgetCategoryId == budgetCategoryId);
  }

  startEdit() {
    this.editMode = true;
    this.$nextTick(() => {
      const editor = this.$refs['textEditor'];
      if (!editor) {
        console.log('no editor');
        return;
      }
      (editor as HTMLElement).focus();
    });
  }

  cancelEdit() {
    this.innerValue = !this.value ? null : this.value;
    this.editMode = false;
  }

  categoryColor(budgetCategoryId): string {
    const categoryType = this.getBudgetCategory(budgetCategoryId)?.budgetCategoryType;
    return categoryType ? eBudgetCategoryType[categoryType].toLowerCase() : '';
  }

  get iconKey() {
    return this.budgetCategoryIcons.find(v => v.budgetCategoryIconId == this.innerValue)?.iconKey;
  }

  async setIcon(budgetCategoryIconId) {
    this.innerValue = budgetCategoryIconId;
    this.finishEdit();
  }

  async finishEdit() {
    this.$nextTick(() => {
      if (JSON.stringify(this.innerValue) != JSON.stringify(this.initialValue)) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          this.$emit('input', this.innerValue);
          this.$emit('change', this.innerValue);
        }, 50);
      }
      this.editMode = false;
    });
  }

  selectCategory(category: BudgetCategoryDto) {
    this.innerValue = category.budgetCategoryId;
    this.finishEdit();
  }

  @Watch('value')
  OnValueChange(value) {
    this.innerValue = !value ? null : value;
    this.initialValue = JSON.parse(JSON.stringify(this.value));
  }
}
</script>

<style>
.inline-field {
  display: flex;
  flex-direction: row;
}
.inline-field--display {
  cursor: text;
  flex-grow: 1;
  min-height: 10px;
  padding: 2px;
}
.inline-field--display:hover {
  background-color: #f5f5f5;
}
.inline-select--display {
  cursor: pointer;
  flex-grow: 1;
  min-height: 10px;
  padding: 2px;
}
.inline-select--display:hover {
  background-color: #00000013;
  border-radius: 100%;
}
.inline-field--editor,
.inline-field--editor .v-text-field__slot {
  flex-grow: 1;
  font-size: 14px !important;
}
.inline-field--editor .v-input__slot {
  min-height: 28px !important;
}
.inline-field--editor .v-icon {
  font-size: 18px !important;
}
.inline-field--editor .v-input__append-inner {
  margin-top: 3px !important;
}
</style>
