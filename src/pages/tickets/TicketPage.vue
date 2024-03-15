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
      <!--Создание тикета-->
      <div class="q-gutter-md q-pb-md" v-if="selectTicketID == null">
        <q-card>
          <q-card-section>
            <div class="q-pb-md">
              <div class="q-dialog__title">Тема</div>
            </div>
            <div class="q-gutter-md q-pb-md">
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
                :rules="[(val) => val != null]"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      No options slot
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pb-md">
              <div class="q-dialog__title">Назначенный пользователь</div>
            </div>
            <div class="q-gutter-md q-pb-md">
              <q-select
                outlined
                bg-color="white"
                hide-bottom-space
                v-model="modelusersForOwner"
                :options="usersForOwner"
                option-label="name"
                option-value="id"
                map-options
                emit-value
                label="Выберете пользователя"
                :rules="[(val) => val != null]"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      No options slot
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pb-md row">
              <div class="q-dialog__title col-grow">Ваш тикет</div>
              <div class="text-grey col-lg-2">Заголовок тикета</div>
            </div>
            <div class="q-pb-md">
              <q-input outlined bg-color="white" v-model="ticketTitle"/>
            </div>
            <div class="q-pb-md row justify-end">
              <div class="text-grey col-lg-2">Красткое описание тикета</div>
            </div>
            <div class="q-pb-md">
              <q-input
                outlined
                bg-color="white"
                v-model="ticketDiscription"
                type="textarea"
              />
            </div>
            <div class="q-dialog__footer q-pb-md">
              <q-btn unelevated no-caps icon="attach_file" />
              <q-btn
                unelevated
                outline
                no-caps
                color="primary"
                label="Отмена"
                to="/"
              />
              <q-btn
                unelevated
                no-caps
                color="primary"
                label="Создать"
                @click="createTicket"
              />
            </div>
            <q-separator />
          </q-card-section>
        </q-card>
      </div>
      <!--Работа с открытым тикетом-->
      <div class="q-pb-md" v-else-if="selectTicketID != null">
        <q-card>
          <q-card-section>
            <div class="row justify-between">
              <div class="col-lg-8 col-md-8 col-xs-12 ">

                <div class="q-dialog__title">ТИКЕТ</div>
                <p>{{ selectTicketID.title }}</p>
                <div class="q-dialog__title">Текст тикета</div>
                <p>{{ selectTicketID.description }}</p>

              </div>
              <div class="col-grow">
                <div class="row col-lg-9 col-md-9 col-xs-12 q-pb-md">
                  <div class="col-lg-10 col-md-9 col-xs-12  q-dialog__title">
                    Статус
                  </div>
                  <div class="col-lg-2 col-md-2 col-xs-12 q-pb-md">
                    {{ textStatus }}
                  </div>
                </div>
                <div class="row col-lg-9 col-md-9 col-xs-12 q-pb-md">
                  <div class="col-lg-10 col-md-9 col-xs-12 q-dialog__title">
                    Опертатор
                  </div>
                  <div class="col-lg-2 col-md-2 col-xs-12 q-pb-md">
                    заглушка
                  </div>
                </div>
                <div class="q-pb-md col-lg-9 col-md-9 col-xs-12 row  justify-evenly ">
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    label="открыть чат"
                    style="width: 40%"
                    to="/chat"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    label="изменить"
                    style="width: 40%"
                  />
                </div>
                <div class="col-lg-9 col-md-9 col-xs-12 q-pb-md">
                  <div class="q-dialog__title">Файлы</div>
                  <q-list separator>
                    <q-item
                      v-for="(option, index) in options"
                      :key="index"
                      class="q-my-sm"
                      clickable
                      v-ripple
                    >
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
      modelusersForOwner: ref(null),
      usersForOwner: ref([]),
      options: [
        "file1.doc",
        "file2.doc",
        "file3.doc",
        "file4.doc",
        "file5.doc",
      ],
      selectTicketID: ref(null),
      colorStatus: ref("positive"),
      textStatus: ref("Новый"),
      ticketTitle: ref(''),
      ticketDiscription: ref(""),
    };
  },
  async beforeMount() {
    await this.getData();
  },
  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;

      this.selectTicketID = this.$q.appStore.selectedTicket;

      if (this.selectTicketID == null) {

        this.$q.appStore.set({numOfMsgInTicket:0})
        if (this.$q.appStore.usersList != null) {

          this.usersForOwner = this.$q.appStore.usersList.filter((obj) => obj.roleId == 4 && obj.isDeleted == false);
          console.log(this.usersForOwner);
        }


        if (this.$q.appStore.servicesList != null) {
          this.titles = this.$q.appStore.servicesList.map((obj) => obj.title);
        }
      } else {

        const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "getList",
        args: {
          limit: 0,
            },
          });

        this.$q.appStore.set({numOfMsgInTicket:response.args.count})

        switch (this.selectTicketID.ticketStatusId) {
          case 1:
            this.colorStatus = "positive";
            this.textStatus = "Новый";
            break;
          case 2:
            this.colorStatus = "negative";
            this.textStatus = "Открыт";
            break;
          case 3:
            this.colorStatus = "negative";
            this.textStatus = "Закры";
            break;
          case 4:
            this.colorStatus = "warning";
            this.textStatus = "Восстановлен";

            break;
        }
      }
    },
    getIdFromTitle(title) {
      const item = data.find((obj) => obj.title === title);
      return item ? item.id : null;
    },
   async createTicket() {
        const foundItem = this.$q.appStore.servicesList.find(item => item.title === this.model);
        const foundId = foundItem ? foundItem.id : null;

        console.log(this.modelusersForOwner);

        const response = await this.$q.ws.sendRequest({
        type: 'query',
        iface: 'ticket',
        method: 'add',
        args: {
          ticket: {
            serviceId: foundId,
            ownerId: this.modelusersForOwner,
            title: this.ticketTitle,
            description: this.ticketDiscription,
            startDateTime : new Date(),
          }
        }
      });


      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка создания списка тикетов",
          ok: {
            color: "red",
          },
        });
      }
      // Если тикет успешно создан
      else if (response.type === "answer") {
        this.$router.push({ path: '/'});
      }
    },

  },
});
</script>
