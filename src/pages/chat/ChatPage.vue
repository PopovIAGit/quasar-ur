<template>
  <q-page>
    <div class="container">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon name="chevron_right" color="grey-6" />
        </template>
        <q-breadcrumbs-el icon="home" to="/" />
        <q-breadcrumbs-el label="Чат" />
      </q-breadcrumbs>

      <h1>Чат</h1>

      <div class="q-gutter-md q-pb-md">
        <q-card>
          <q-card-section class="row">
            <q-btn icon="chevron_left" dense flat to="/" />
            <div class="text-grey">{{ User.name + " " + User.surname }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-infinite-scroll @load="onLoad" :offset="250">
              <div ref="messageContainer" class="message-container">
                <q-chat-message
                  v-for="(message, key) in messages"
                  :key="key"
                  :name="message.ownerId"
                  :text="[message.content]"
                  :sent="
                    message.ownerId == this.$q.appStore.user.id ? true : false
                  "
                />
              </div>
            </q-infinite-scroll>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-input
              outlined
              dense
              bg-color="grey-3"
              v-model="msgDataToSend"
              label="Напишите сообщение"
              @keyup.enter="sendMsg"
            >
              <template v-slot:after>
                <q-btn round dense flat icon="send" @click="sendMsg" />
              </template>
            </q-input>
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
  name: "ChatPage",

  setup() {
    return {
      ready: ref(true),
      loading: ref(false),
      msgDataToSend: ref(""),
      User: ref(null),
      messages: ref([]),
      newMessages: ref([]),
    };
  },

  async beforeMount() {
    await this.getData();

    await this.$q.ws.onUnpackedMessage.addListener(data => {

      if (data.type === 'notice' && data.args.action === "message") {
        console.log('Новое сообщение:', data.args.args);
        this.newMessages.push(data);
      }
    });

  },

  async mounted(){

  },

  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;
      this.User = this.$q.appStore.user;
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "getList",
        args: {},
      });

      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка пользователей",
          ok: {
            color: "red",
          },
        });
      }
      // Если получен список пользователей
      else if (response.type === "answer") {
        this.messages = response.args.rows.filter(
          (row) => row.ticketId === this.$q.appStore.selectedTicket.id
        );

      }
      this.ready = true;
      this.loading = false;
    },

    async sendMsg() {
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "send",
        args: {
          message: {
            ownerId: this.$q.appStore.user.id,
            content: this.msgDataToSend.toString(),
            ticketId: this.$q.appStore.selectedTicket.id,
            sentDateTime: new Date(),
          },
        },
      });
      if (response.type === "error") {

      } else if (response.type === "answer") {
        this.newMessages.push(response.args)
        console.log(response.args);
        this.msgDataToSend = "";
      }
    },

    onLoad(index, done) {

                // Логика загрузки новых данных и добавления в messages
                // Например, получение новых сообщений и добавление их в messages

                //  this.messages = [...this.messages, ...this.newMessages];
                if (this.newMessages.length  != 0) {
                    console.log(this.newMessages);
                //  this.messages.push(this.newMessages);
                  this.newMessages.length = 0;
                }

                // Прокрутка контейнера сообщений вниз, если высота содержимого превышает высоту контейнера
                done();
    },
  },
});
</script>
<style scoped>
.message-container {
    max-height: 600px; /* Замените на нужную вам высоту контейнера */

    overflow-y: auto;
}
</style>
