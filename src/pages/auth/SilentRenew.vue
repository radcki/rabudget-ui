<template>
  <div></div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { vuexOidcProcessSilentSignInCallback } from 'vuex-oidc';

@Component
export default class App extends Vue {
  created() {
    vuexOidcProcessSilentSignInCallback();
  }
}
</script>
