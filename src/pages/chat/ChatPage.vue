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

      <div class="q-gutter-md q-pb-md row justify-center">
        <div style="max-width: 800px" class="col-lg-8 col-md-8 col-xs-12">
          <q-card style="min-width: 320px">
            <q-card-section class="row q-dialog__header">
              <q-btn icon="chevron_left" dense flat to="/" unelevated no-caps />
              <div class="text-grey">{{ User.name + " " + User.surname }}</div>
              <div class="text-grey">{{ $q.appStore.selectedTicket.id }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <q-scroll-area
                style="height: 400px; max-height: 750px"
                ref="scrollAreaRef"
              >
                <q-infinite-scroll
                  @load="onLoad"
                  :offset="250"
                  reverse
                  ref="infinitescrollAreaRef"
                >
                  <div class="row justify-evenly q-pa-md">
                    <div style="width: 100%; max-width: 800px">
                      <q-chat-message
                        v-for="message in messages"
                        :key="message.id"
                        :name="
                          message.ownerId == this.User.id
                            ? this.User.name
                            : 'Заменить на имя'
                        "
                        :text="[message.content]"
                        :sent="message.ownerId == this.User.id ? true : false"
                      />
                    </div>
                  </div>
                  <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                      <q-spinner-dots color="primary" size="40px" />
                    </div>
                  </template>
                </q-infinite-scroll>
              </q-scroll-area>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <q-input
                outlined
                dense
                autogrow
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
        <div style="max-width: 350px" class="col-lg-3 col-md-3 col-xs-12">
          <q-card style="min-width: 320px">
            <q-card-section class="row q-dialog__header">
              <div class="text-grey">Список тикетов</div>
            </q-card-section>
            <q-card-section class="row q-dialog__header">
              <q-scroll-area
                style="height: 600px; max-height: 750px"
                ref="scrollTicketsRef"
              >
                <div v-for="n in 100" :key="n" class="q-py-xs">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </div>
              </q-scroll-area>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, nextTick } from "vue";
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
      scrollAreaRef: ref(null),
      infinitescrollAreaRef: ref(null),
      position: ref(500),
      ticketsList: ref([]),
    };
  },

  async beforeMount() {
    await this.getData();

    await this.$q.ws.onUnpackedMessage.addListener((data) => {
      console.log(data);

      if (data.type === "notice" && data.args.action === "message") {
        // this.messages.push(data.args.args);
        this.addNewMessage(data.args.args);
        //this.newMessages.push(data.args.args);
      }
    });
  },

  mounted() {},

  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;
      this.User = this.$q.appStore.user;
      this.ticketsList = this.$q.appStore.ticket;

      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "getList",
        args: {
          limit: 10,
          offset: this.$q.appStore.numOfMsgInTicket - 10,
        },
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
      } else if (response.type === "answer") {
        this.messages = response.args.rows.filter(
          (row) => row.ticketId === this.$q.appStore.selectedTicket.id
        );
      }

      await nextTick(() => {
        this.scrollToEnd();
      });

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
            ownerId: this.User.id,
            content: this.msgDataToSend,
            ticketId: this.$q.appStore.selectedTicket.id,
            sentDateTime: new Date(),
          },
        },
      });
      if (response.type === "error") {
        console.error("error", response.args);
      } else if (response.type === "answer") {
        //this.messages.push(response.args);
        this.msgDataToSend = "";
        this.addNewMessage(response.args);
      }
    },

    scrollToEnd() {
      const vm = this;
      setTimeout(function () {
        vm.scrollAreaRef.setScrollPercentage("vertical", 1);
      }, 100);
    },

    async onLoad(index, done) {
      await setTimeout(() => {
        if (index > 1) {
          const n = 10; // Ваше изначальное число, которое может быть заменено
          const ost = this.$q.appStore.numOfMsgInTicket - n * index; // Рассчитываем динамический лимит
          let dynamicLimit = 0;

          if (ost > 0) {
            this.infinitescrollAreaRef.resume();
            if (ost < n) {
              dynamicLimit = this.$q.appStore.numOfMsgInTicket - n * index;
            } else dynamicLimit = n;
          } else {
            this.infinitescrollAreaRef.stop();
          }
          const response = this.$q.ws.sendRequest({
            type: "query",
            iface: "message",
            method: "getList",
            args: {
              limit: dynamicLimit,
              offset: this.$q.appStore.numOfMsgInTicket - n * index,
            },
          });

          response.then((data) => {
            if (data.args.rows.length > 0) {
              let tmpArr = data.args.rows.concat(this.messages);
              this.messages = tmpArr;
            } else done();
          });

          done();
        } else {
          done();
        }
      }, 1000);
    },
    async addNewMessage(message) {
      this.messages.push(message);

      await nextTick(() => {
        this.scrollToEnd();
      });
    },
  },
  watch: {
    messages: {
      handler(val, oldVal) {
        // this.scrollToEnd();
      },
      deep: true,
    },
  },
});
</script>
