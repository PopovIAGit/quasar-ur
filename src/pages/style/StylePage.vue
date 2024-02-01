<template>
  <q-page>
    <div class="container">

      <div class="q-pb-md">
        <h1>Best practices for successful prototypes</h1>
        <h2>Best practices for successful prototypes</h2>
        <h3>Best practices for successful prototypes</h3>
        <h4>Best practices for successful prototypes</h4>
        <h5>Best practices for successful prototypes</h5>
        <h6>Best practices for successful prototypes</h6>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-btn unelevated no-caps color="primary" label="Primary"/>
        <q-btn unelevated no-caps color="primary" icon="mail" icon-right="send" label="On Left and Right"/>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-input outlined bg-color="white" v-model="inputText"/>
        <q-input outlined bg-color="white" v-model="inputText">
          <template v-slot:prepend>
            <q-icon name="person"/>
          </template>
          <template v-slot:append>
            <q-icon name="mail"/>
          </template>
        </q-input>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-select outlined bg-color="white" v-model="select" :options="options"/>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-checkbox v-model="checked" label="Label on Right"/>
        <q-radio v-model="radio" val="one" label="One"/>
        <q-radio v-model="radio" val="two" label="Two"/>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-breadcrumbs>
          <template v-slot:separator>
            <q-icon
              name="chevron_right"
              color="grey-6"
            />
          </template>
          <q-breadcrumbs-el icon="home" to="/"/>
          <q-breadcrumbs-el label="Docs" to="/start/pick-quasar-flavour"/>
          <q-breadcrumbs-el label="Breadcrumbs" to="/vue-components/breadcrumbs"/>
          <q-breadcrumbs-el label="Build"/>
        </q-breadcrumbs>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-card>
          <q-card-section>
            {{ lorem }}
          </q-card-section>
        </q-card>
      </div>

      <div class="q-gutter-md q-pb-md">
        <q-btn unelevated no-caps label="Modal (dialog)" color="primary" @click="modal = true"/>
        <q-dialog v-model="modal">
          <q-card>
            <q-card-section class="q-dialog__header">
              <div class="q-dialog__header-content">
                <div class="text-grey">Tempor incididunt ut labore</div>
                <div class="q-dialog__title">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod</div>
              </div>
              <q-btn icon="close" flat round dense v-close-popup/>
            </q-card-section>
            <q-card-section class="q-dialog__body">
              {{ lorem }}
            </q-card-section>
            <q-card-section class="q-dialog__footer">
              <q-btn class="q-btn--outline-muted" outline label="Отмена" v-close-popup/>
              <q-btn unelevated color="primary" label="OK" v-close-popup/>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'StylePage',

  setup () {
    return {
      inputText: ref(''),
      checked: ref(false),
      radio: ref(null),
      select: ref('Google'),
      options: ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'],
      lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      modal: ref(false)
    }
  }
})
</script>
