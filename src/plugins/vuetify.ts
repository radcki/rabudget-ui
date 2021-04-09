import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        income: colors.lightGreen.darken3,
        saving: colors.blue.base,
        spending: colors.amber.base,
        allocation: colors.purple.darken1,
        primary: colors.teal.darken4,
        secondary: colors.red.darken3,
      },

      dark: {
        income: colors.green.darken4,
        saving: colors.lightBlue.darken4,
        spending: colors.orange.darken4,
        allocation: colors.purple.darken4,
        primary: colors.teal.darken2,
        secondary: colors.red.darken1,
      },
    },
  },
});
