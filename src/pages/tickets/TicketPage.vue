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

      <div class="q-gutter-md q-pb-md" v-if="selectTicketID == null">
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
              <q-btn
                unelevated
                outline
                no-caps
                color="primary"
                label="Отмена"
                to="/"
              />
              <q-btn unelevated no-caps color="primary" label="Создать" />
            </div>
            <q-separator />
            <q-btn unelevated no-caps icon="attach_file" />
          </q-card-section>
        </q-card>
      </div>

      <div class="q-gutter-md q-pb-md" v-else-if="selectTicketID != null">
        <q-card>
          <q-card-section>
            <div class="row">
              <div class="col-lg-9 col-md-9 col-xs-12 q-gutter-md q-pb-md ">
                <h4>ТИКЕТ</h4>
                <p>{{ selectTicketID.title }}</p>
                <h4>Текст тикета</h4>
                <p>{{ selectTicketID.description }}</p>
              </div>
              <div class="row col-lg-3 col-md-3 col-xs-12 q-gutter-md q-pb-md ">
                <div class="row col-lg-9 col-md-9 col-xs-12">
                  <div class="col-lg-6 col-md-6 col-xs-12">Статус тикета</div>
                  <div class="col-lg-6 col-md-6 col-xs-12"></div>
                </div>
                <div class="col-lg-9 col-md-9 col-xs-12">
                  <h4>Назначеный опертатор</h4>
                </div>
                <div class="col-lg-9 col-md-9 col-xs-12">
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    label="открыть чат"
                  />
                </div>
                <div class="col-lg-9 col-md-9 col-xs-12">
                  <h4>Файлы</h4>
                  <q-list  separator>
                    <q-item v-for="(option, index) in options" :key="index" class="q-my-sm" clickable v-ripple>
                      <q-item-section>{{ option }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </div>
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
      options: ['file1.doc', 'file1.doc', 'file1.doc', 'file1.doc', 'file1.doc'],
      selectTicketID: ref(null),
    };
  },
  async beforeMount() {
    await this.getData();
  },
  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;

      console.log("полученый тикет", this.$q.appStore.selectedTicket);
      this.selectTicketID = this.$q.appStore.selectedTicket;
      {{ selectTicketID.ticketStatusId }}

        if (selectTicketID == null){
          if (this.$q.appStore.service != null) {
          this.titles = this.$q.appStore.service.map((obj) => obj.title);
        }

      }

    },
  },
});
</script>
