<template>

  <!-- Render only when app ready -->
  <template v-if="this.$q.appStore.ready">

    <!-- Login window -->
    <login-window v-if="!this.$q.appStore.user"/>

    <!-- Main layout -->
    <q-layout view="lHh lpR fFf" v-else>
      <!-- Header -->
      <header-component
        @toggleLeftDrawer="toggleLeftDrawer"
      />
      <!-- Left drawer -->
      <drawer-left
        ref="DrawerLeft"
      />
      <!-- Page -->
      <q-page-container>
        <router-view />
      </q-page-container>
    </q-layout>

  </template>

</template>

<script>
import { defineComponent, ref } from 'vue'

import LoginWindow from 'components/LoginWindow'
import HeaderComponent from 'components/HeaderComponent'
import DrawerLeft from 'components/DrawerLeft'

export default defineComponent({
  name: 'MainLayout',

  components: {
    LoginWindow,
    HeaderComponent,
    DrawerLeft
  },

  setup () {
    return {

    }
  },

  methods: {
    toggleLeftDrawer () {
      this.$refs.DrawerLeft.toggle()
    }
  }
})
</script>
