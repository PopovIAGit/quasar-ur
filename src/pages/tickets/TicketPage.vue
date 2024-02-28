<template>
  <q-page>
    <div class="container">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon name="chevron_right" color="grey-6" />
        </template>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Тикеты" />
      </q-breadcrumbs>

      <h1>Тикеты</h1>

      <div>
        <q-card>
          <q-card-section>

          </q-card-section>
          <q-card-actions>
            <h4>Тема</h4>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="model"
              :options="title"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              label="Выберете тему обращения"
              :rules="[ val => Theme.fields.roleId.rules(val) ]"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey">
                    No options slot
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

import UserClass from "src/utils/classes/User.Class";

export default defineComponent({
  name: "TicketPage",

  setup() {

    const title = [];

    console.log("title",title);



    return {
      model: ref(null),
      ready: ref(true),
      title,
    };
  },
  async beforeMount () {
    await this.getData();
  },
  methods: {
    async getData (props) {
      if (this.loading) return;
      this.loading = true;

      title = this.$q.appStore.theme;
      console.log('title',title);


    },


  }
});
</script>
