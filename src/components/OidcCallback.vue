<template>
  <div></div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

const oidcStore = namespace('oidcStore');

@Component
export default class OidcCallback extends Vue {
  @oidcStore.Action('oidcSignInCallback') oidcSignInCallback!: () => Promise<string>;
  mounted() {
    this.oidcSignInCallback()
      .then(redirectPath => {
        this.$router.push(redirectPath);
      })
      .catch(err => {
        console.error(err);
        this.$router.push('/oidc-callback-error'); // Handle errors any way you want
      });
  }
}
</script>
