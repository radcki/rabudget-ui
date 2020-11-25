<template>
  <v-navigation-drawer
    v-model="drawer"
    width="260"
    dark
    color="teal darken-4"
    enable-resize-watcher
    mobile-breakpoint="960"
    class="elevation-2"
    :floating="!mobile"
    app
    :mini-variant="minNav"
  >
    <v-expand-transition>
      <v-list class="py-0" color="secondary">
        <v-list-item>
          <v-list-item-content v-if="!minNav" class="pb-1">
            <v-list-item-title>
              <span class="title white--text" style="font-size: 1.5em !important">raBudget</span>
            </v-list-item-title>
            <v-list-item-subtitle class="mt-2">
              <span class="title white--text px-3" style="font-size: 1.2em !important">{{
                activeBudgetText
              }}</span>
              <v-btn icon small @click="openBudgetsDialog()">
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn v-if="!mobile" icon dark @click.stop="minNavSelected = !minNavSelected">
              <v-icon>{{ minNav ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
            </v-btn>
            <v-btn v-if="mobile" icon dark @click.stop="drawer = !drawer">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-expand-transition>

    <template v-slot:append>
      <v-expand-transition>
        <div v-if="!minNav" class="navigationBarAccent pb-3">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-subtitle> {{ $t('account.logged') }}: </v-list-item-subtitle>
              <v-list-item-title class="py-3"> test </v-list-item-title>
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
            <v-col v-if="isAuthenticated" class="text-center">
              <v-btn icon to="/profile">
                <v-icon>mdi-account-box-outline</v-icon>
              </v-btn>
            </v-col>
            <v-col class="text-center">
              <v-btn icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
                <v-icon>mdi-weather-night</v-icon>
              </v-btn>
            </v-col>
            <v-col v-if="isAuthenticated" class="text-left" @click="logout">
              <v-btn icon>
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
      <v-divider></v-divider>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { Budget } from '@/typings/api/budget/GetBudgetList';
import { modalService } from 'vue-modal-dialog';

const budgetsStore = namespace('budgets');
const accountStore = namespace('account');
const oidcStore = namespace('oidcStore');

@Component({
  components: {},
})
export default class App extends Vue {
  drawer = true;

  minNavSelected = true;
  get minNav() {
    return this.mobile ? false : this.minNavSelected;
  }

  get mobile() {
    return this.$vuetify.breakpoint.mobile;
  }

  get activeBudgetText(): string {
    return this.activeBudget ? this.activeBudget.name : this.$t('general.none').toString();
  }

  @budgetsStore.State('budgets') budgets!: Budget[];
  @budgetsStore.Getter('activeBudget') activeBudget!: Budget;
  @accountStore.Action('logout') logout!: () => Promise<void>;
  @oidcStore.Getter('oidcIsAuthenticated') isAuthenticated!: boolean;
  @oidcStore.Getter('oidcUser') user!: any;

  async openBudgetsDialog() {
    const budgetsManager = () => import('@/modals/BudgetsManager.vue');
    await modalService
      .open(budgetsManager, {
        data: { width: 900, title: this.$t('budgetsManager.title').toString() },
      })
      .then(
        modalSubmit => {
          console.log('modalSubmit', modalSubmit);
        },
        modalCancel => {
          console.log('modalCancel', modalCancel);
        },
      )
      .catch(err => {
        console.log('err', err);
      });
  }
}
</script>
