<template>
  <v-app>
    <navigation-drawer />

    <v-main>
      <router-view></router-view>
    </v-main>
    <!--
    <modal-dialog></modal-dialog> -->
    <r-modal />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Action, namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import NavigationDrawer from '@/components/NavigationDrawer.vue';

const budgetsStore = namespace('budgets');
const accountStore = namespace('account');
const oidcStore = namespace('oidcStore');

@Component({
  components: {
    NavigationDrawer,
  },
})
export default class App extends Vue {
  drawer = true;
  loadingOverlay = false;

  minNavSelected = true;
  get minNav() {
    return this.mobile ? false : this.minNavSelected;
  }

  get mobile() {
    return this.$vuetify.breakpoint.mobile;
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
