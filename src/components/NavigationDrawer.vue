<template>
  <v-navigation-drawer
    v-model="drawerVisible"
    width="260"
    dark
    :color="drawerColor"
    class="elevation-2"
    :floating="!isMobile"
    mobile-breakpoint="600"
    app
    :mini-variant="minNav"
  >
    <v-expand-transition>
      <v-list class="py-0" :color="drawerTopColor">
        <v-list-item>
          <v-list-item-action v-if="!minNav" class="mr-4">
            <a href="/">
              <v-img src="/rb.svg" max-height="50" max-width="30" :contain="true"></v-img>
            </a>
          </v-list-item-action>
          <v-list-item-content v-if="!minNav" class="pb-1">
            <v-list-item-title>
              <span class="title white--text px-3" style="font-size: 1.2em !important">
                {{ activeBudgetText }}
              </span>
              <v-btn icon small @click="openBudgetsDialog()">
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn v-if="!isMobile" icon dark @click.stop="minNavSelected = !minNavSelected">
              <v-icon>{{ minNav ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
            </v-btn>
            <v-btn v-if="isMobile" icon dark @click.stop="drawer = !drawer">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-expand-transition>

    <v-list>
      <menu-item
        v-for="(item, i) in menuItems"
        :key="item.name + i.toString()"
        :name="item.name"
        :icon="item.icon"
        :to="item.to"
        :children="item.children"
        :collapsed="minNav"
      ></menu-item>
    </v-list>

    <template v-slot:append>
      <v-expand-transition>
        <div v-if="!minNav" class="navigationBarAccent pb-3">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-subtitle> {{ $t('account.logged') }}: </v-list-item-subtitle>
              <v-list-item-title class="py-3">{{ user.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-row no-gutters>
            <v-col class="text-right">
              <v-menu>
                <template v-slot:activator="{ on }">
                  <v-btn icon v-on="on">
                    <v-icon class="mr-2">mdi-web</v-icon>
                  </v-btn>
                </template>
              </v-menu>
            </v-col>
            <v-col v-if="isAuthenticated && accountManagementUrl" class="text-center">
              <icon-button
                icon="mdi-account-box-outline"
                @click="openAccountManagement()"
              ></icon-button>
            </v-col>
            <v-col class="text-center">
              <v-btn icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
                <v-icon>mdi-weather-night</v-icon>
              </v-btn>
            </v-col>
            <v-col v-if="isAuthenticated" class="text-left">
              <icon-button
                icon="mdi-logout"
                :tooltip="$t('account.logOut')"
                @click="logout()"
              ></icon-button>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
      <v-divider></v-divider>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import { MenuItem } from '@/typings/MenuItem';
import MenuItemComponent from '@/components/MenuItem.vue';

const budgetsStore = namespace('budgets');
const accountStore = namespace('account');
const oidcStore = namespace('oidcStore');

@Component({
  components: {
    'menu-item': MenuItemComponent,
  },
})
export default class NavigationDrawer extends Vue {
  @Prop(Boolean) collapsed!: boolean;

  drawer = true;
  minNavSelected = true;

  get drawerVisible() {
    if (!this.isMobile) {
      return true;
    }
    return this.drawer;
  }
  set drawerVisible(value: boolean) {
    this.drawer = value;
  }

  get minNav() {
    return this.isMobile ? false : this.minNavSelected;
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  get drawerColor() {
    return this.$vuetify.theme.dark ? '#1e1e1e' : 'teal darken-4';
  }

  get drawerTopColor() {
    return this.$vuetify.theme.dark ? 'teal darken-4' : 'secondary';
  }

  get activeBudgetText(): string {
    return this.activeBudget ? this.activeBudget.name : this.$t('general.none').toString();
  }

  get menuItems(): MenuItem[] {
    if (!this.activeBudget) {
      return [];
    }
    return [
      {
        name: this.$t('overview.title').toString(),
        icon: 'mdi-home',
        to: { name: 'overview' },
        children: [],
      },
      {
        name: this.$t('trasnsactionHistory.title').toString(),
        icon: 'mdi-format-list-bulleted',
        to: { name: 'transactionsHistory' },
        children: [],
      },
      {
        name: this.$t('allocationsHistory.title').toString(),
        icon: 'mdi-subdirectory-arrow-right',
        to: { name: 'allocationsHistory' },
        children: [],
      },
      {
        name: this.$t('budgetCategories.title').toString(),
        icon: 'mdi-tune',
        to: { name: 'budgetCategories' },
        children: [],
      },
      {
        name: this.$t('transactionsAnalysis.title').toString(),
        icon: 'mdi-text-search',
        to: { name: 'transactionsAnalysis' },
        children: [],
      },
    ];
  }

  @budgetsStore.State('budgets') budgets!: Budget[];
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @accountStore.Action('logout') logout!: () => Promise<void>;
  @accountStore.Getter('accountManagementUrl') accountManagementUrl!: string;
  @oidcStore.Getter('oidcIsAuthenticated') isAuthenticated!: boolean;
  @oidcStore.Getter('oidcUser') user!: any;

  async openBudgetsDialog() {
    const budgetsManager = () => import('@/modals/BudgetsManager.vue');

    await this.$modal.open(budgetsManager, null, {
      width: 900,
      title: this.$t('budgetsManager.title').toString(),
    });
  }

  openAccountManagement() {
    window.open(this.accountManagementUrl, '_blank');
  }

  @Watch('drawer')
  onDrawerVisibilityChange(newValue) {
    this.$emit('update:collapsed', newValue);
  }
  @Watch('collapsed')
  onCollapsedChange(newValue) {
    this.drawer = newValue;
  }
}
</script>
