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

      <div class="q-gutter-md q-pb-md">
        <q-card>
          <q-card-section>
            <h4>Тема</h4>
            <q-select
              outlined
              bg-color="white"
              hide-bottom-space
              v-model="model"
              :options="titles"
              option-label="name"
              option-value="id"
              map-options
              emit-value
              label="Выберете тему обращения"
              :rules="[(val) => Theme.fields.roleId.rules(val)]"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey">
                    No options slot
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <h4>Ваш тикет</h4>
            <q-input
              outlined
              bg-color="white"
              v-model="inputText"
              type="textarea"
            />
            <div class="q-gutter-md q-pb-md">
              <q-btn unelevated outline no-caps color="primary" label="Отмена" />
              <q-btn unelevated no-caps color="primary" label="Создать" />
            </div>
            <q-separator />
            <q-btn unelevated no-caps
  icon="attach_file"
/>
          </q-card-section>

        </q-card>
      </div>



      <div class="q-gutter-md q-pb-md">
        <q-card>
        <q-card-section>
          <h4>тикет №1</h4>
          <p>ticket title</p>
          <h4>текст тикета</h4>
          <p>ticket discripion</p>
        </q-card-section>
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
    return {
      model: ref(null),
      ready: ref(true),
      loading: ref(false),
      titles: ref([]),
    };
  },
  async beforeMount() {
    await this.getData();
  },
  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;

      if (this.$q.appStore.service != null) {
        this.titles = this.$q.appStore.service.map((obj) => obj.title);
      }
    },
  },
});
</script>
