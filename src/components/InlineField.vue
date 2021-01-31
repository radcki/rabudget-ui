<template>
  <div class="inline-field">
    <template v-if="loading">
      <v-progress-circular
        size="10"
        class="mr-1 mt-1"
        width="2"
        indeterminate
      ></v-progress-circular>
    </template>
    <template v-if="!editMode">
      <template v-if="type == 'text'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue }}</div>
      </template>
      <template v-if="type == 'date'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue | shortDate }}</div>
      </template>
      <template v-if="type == 'money'">
        <div class="inline-field--display" @click="startEdit()">{{ innerValue | money }}</div>
      </template>
      <template v-if="type == 'category'">
        <div class="inline-field--display text-center" @click="startEdit()">
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

      <template v-if="type == 'category'">
        <div class="inline-field--editor" @click="startEdit()">
          <v-select
            ref="textEditor"
            v-model="innerValue"
            :return-object="false"
            :items="budgetCategories"
            item-value="budgetCategoryId"
            item-name="name"
            class="px-0 mx-0"
            :style="hideCategoryName ? 'max-width: 50px' : 'max-width: 150px'"
            filled
            hide-details
            :clearable="clearable"
            :autofocus="true"
            @keyup.enter="finishEdit()"
            @keyup.esc="cancelEdit"
            @click:append="cancelEdit"
            @blur="finishEdit()"
          >
            <template #selection="{ item }">
              <v-icon :size="30" :left="!hideCategoryName">
                {{ item.budgetCategoryIconKey }}
              </v-icon>
              <span v-if="!hideCategoryName">
                {{ item.name }}
              </span>
            </template>
            <template #item="{ item }">
              <v-icon left>
                {{ item.budgetCategoryIconKey }}
              </v-icon>
              {{ item.name }}
            </template>
          </v-select>
        </div>
      </template>
    </template>
  </div>
</template>

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

<script lang="ts">
import { BudgetCategoryDto } from '@/typings/api/budgetCategories/GetBudgetCategoriesList';
import { eBudgetCategoryType } from '@/typings/enums/eBudgetCategoryType';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import DateField from './DateField.vue';
import MoneyField from './MoneyField.vue';

const budgetsStore = namespace('budgets');

@Component({
  components: {
    DateField,
    MoneyField,
  },
})
export default class InlineField extends Vue {
  @Prop({ type: [String, Date, Number, Object] }) value!: Date | string | number;
  @Prop(Boolean) loading!: boolean;
  @Prop({ type: String, default: 'text' }) type!: string;
  @Prop({ type: Number, required: false }) categoryType!: eBudgetCategoryType | null;
  @Prop(Boolean) hideCategoryName!: boolean;
  @Prop(Boolean) clearable!: boolean;

  innerValue = this.value;
  initialValue = JSON.parse(JSON.stringify(this.value));
  editMode = false;
  timeout: null | NodeJS.Timeout = null;

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

  @Watch('value')
  OnValueChange(value) {
    this.innerValue = !value ? null : value;
    this.initialValue = JSON.parse(JSON.stringify(this.value));
  }

  mounted() {
    //
  }
}
</script>
