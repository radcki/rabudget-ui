import Vue from 'vue';
import Router from 'vue-router';
import OidcCallback from '@/components/OidcCallback.vue';
import OidcPopupCallback from '@/components/OidcPopupCallback.vue';
import OidcCallbackError from '@/components/OidcCallbackError.vue';
import store from '@/store';
import { vuexOidcCreateRouterMiddleware } from 'vuex-oidc';
// const BudgetCategories = () => import('@/pages/budgetCategories/BudgetCategories.vue');
// const EditBudget = () => import('@/pages/budgets/EditBudget.vue');
// const Overview = () => import('@/pages/overview/Overview.vue');
// const Transactions = () => import('@/pages/history/Transactions.vue');
// const Allocations = () => import('@/pages/history/Allocations.vue');
// const Reports = () => import('@/pages/reports/Reports.vue');
// const TransactionSchedules = () => import('@/pages/transactionSchedules/TransactionSchedules.vue');

Vue.use(Router);
const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: { name: 'overview' },
    },
    {
      path: '/budget/new',
      name: 'newBudget',
      component: () => import('@/pages/budgets/NewBudget.vue'),
    },
    {
      path: '/overview',
      name: 'overview',
      component: () => import('@/pages/overview/Overview.vue'),
    },
    {
      path: '/budget-categories',
      name: 'budgetCategories',
      component: () => import('@/pages/budgetCategories/BudgetCategories.vue'),
    },
    {
      path: '/transactions-history',
      name: 'transactionsHistory',
      component: () => import('@/pages/transactions/TransactionsHistory.vue'),
    },
    {
      path: '/auth/signinwin/main', // Needs to match redirectUri in you oidcSettings
      name: 'oidcCallback',
      component: OidcCallback,
    },
    {
      path: '/auth/signinpop/main', // Needs to match popupRedirectUri in you oidcSettings
      name: 'oidcPopupCallback',
      component: OidcPopupCallback,
    },
    {
      path: '/oidc-callback-error', // Needs to match redirect_uri in you oidcSettings
      name: 'oidcCallbackError',
      component: OidcCallbackError,
      meta: {
        isPublic: true,
      },
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

router.beforeEach(vuexOidcCreateRouterMiddleware(store, 'oidcStore'));
// router.beforeEach((to, from, next) => {
//   if (router.app.$wait && router.app.$wait.is('dialog')) {
//     router.app.$root.$emit('closeDialogs');
//     return next(false);
//   }
//   next();
// });

//Vue.prototype.$oidc.useRouter(router);
export default router;
