<template>
  <v-app>
    <v-app-bar v-if="isMobile && isAuthenticated" color="primary" dark fixed app>
      <v-app-bar-nav-icon @click="navCollapsed = !navCollapsed"></v-app-bar-nav-icon>
      <v-toolbar-title>raBudget</v-toolbar-title>
    </v-app-bar>
    <navigation-drawer v-if="isAuthenticated" :collapsed.sync="navCollapsed" />

    <v-main>
      <router-view></router-view>
      <mobile-new-transaction v-if="isMobile"></mobile-new-transaction>
    </v-main>
    <r-modal />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Action, namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';

const budgetsStore = namespace('budgets');
const accountStore = namespace('account');
const oidcStore = namespace('oidcStore');

@Component({
  components: {
    NavigationDrawer: () => import('@/components/NavigationDrawer.vue'),
    'mobile-new-transaction': () => import('@/components/MobileNewTransaction.vue'),
  },
})
export default class App extends Vue {
  drawer = true;
  loadingOverlay = false;

  minNavSelected = true;
  navCollapsed = false;
  get minNav() {
    return this.isMobile ? false : this.minNavSelected;
  }

  get isMobile() {
    return !this.$vuetify.breakpoint.smAndUp;
  }

  @budgetsStore.State('budgets') budgets!: Budget[];
  @oidcStore.Getter('oidcIsAuthenticated') isAuthenticated!: boolean;
  @Action('init') initStore!: () => Promise<void>;

  @accountStore.Action('logout') logout!: () => Promise<void>;

  switchLocale(locale: string) {
    console.log(locale);
    //todo
  }

  created() {
    if (this.isAuthenticated) {
      this.initStore();
    }
  }

  @Watch('isAuthenticated')
  onAuthenticationchange(isAuthenticated) {
    if (isAuthenticated) {
      this.initStore();
    }
  }
}
</script>
