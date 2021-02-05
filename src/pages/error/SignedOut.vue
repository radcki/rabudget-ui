<template>
  <v-container class="d-flex" style="height: 100%">
    <v-row align="center" justify="center">
      <v-col class="text-center">
        <v-card width="500" class="mx-auto">
          <v-card-text>
            <h3>
              {{ $t('account.signedOut') }}
            </h3>
            <v-spacer class="my-3"></v-spacer>
            <v-btn :to="{ name: 'home' }" color="primary" text>{{
              $t('general.goTomePage')
            }}</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class SignedOut extends Vue {}
</script>
