<template>
  <q-header class="bg-white text-dark" reveal >
    <q-toolbar>
      <q-btn class="q-header__btn-menu" dense flat round icon="menu" @click="toggleLeftDrawer" />
      <q-toolbar-title>
        Project name
      </q-toolbar-title>
      <q-btn class="q-header__btn-logout" dense flat icon-right="logout" no-caps label="Выйти" :ripple="false" @click="onClickLogout"/>
    </q-toolbar>
  </q-header>
</template>

<script>
import { defineComponent, ref } from 'vue'

import UserClass from 'src/utils/classes/User.Class'

export default defineComponent({
  name: 'HeaderComponent',

  setup () {
    const User = new UserClass();
    return {
      User
    }
  },

  methods: {
    toggleLeftDrawer () {
      this.$emit('toggleLeftDrawer');
    },

    onClickLogout () {
      // Ждать ответа c await смысла не обнаружено
      this.User.logout();
    }
  }
})
</script>
