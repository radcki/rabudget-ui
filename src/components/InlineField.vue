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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import DateField from './DateField.vue';
import MoneyField from './MoneyField.vue';

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

  innerValue = this.value;
  initialValue = JSON.parse(JSON.stringify(this.value));
  editMode = false;

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

  async finishEdit() {
    this.$nextTick(() => {
      if (JSON.stringify(this.innerValue) != JSON.stringify(this.initialValue)) {
        this.$emit('input', this.innerValue);
        this.$emit('change', this.innerValue);
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
