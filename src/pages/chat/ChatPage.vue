<template>
  <q-page>
    <div class="container">

      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon
            name="chevron_right"
            color="grey-6"
          />
        </template>
        <q-breadcrumbs-el icon="home" to="/"/>
        <q-breadcrumbs-el label="Чат"/>
      </q-breadcrumbs>

      <h1>Чат</h1>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ChatPage'
})
</script>
