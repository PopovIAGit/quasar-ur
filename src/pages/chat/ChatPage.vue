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
              <div class="text-grey">
                Выбранный тикет: {{ $q.appStore.selectedTicket.id }}
              </div>
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
                     <div v-if="this.tab == 'tickets'">
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
                    <div v-if="this.tab == 'freechat'">
                      <q-chat-message
                        v-for="(message, key) in messages"
                        :key="key"
                        :name="
                          message.id == this.User.id
                            ? this.User.name
                            : message.id
                        "
                        :text="[message.content]"
                        :sent="message.id == this.User.id ? true : false"
                      />
                    </div>


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
            <q-tabs v-model="tab" no-caps>
              <q-tab name="tickets" icon="list_alt" label="Тикеты">
                <q-badge color="primary" text-color="white" floating>{{
                  ticketsList.length
                }}</q-badge>
              </q-tab>
              <q-tab name="chats" icon="question_answer" label="Free Chat">
                <q-badge color="primary" text-color="white" floating>{{
                  this.$q.appStore.msgFromFreeChat.length
                }}</q-badge>
              </q-tab>
            </q-tabs>
            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="tickets">
                <q-card-section>
                  <q-scroll-area style="height: 350px; max-width: 300px">
                    <q-list
                      separator
                      v-for="ticket in ticketsList"
                      :key="ticket.id"
                      class="q-py-xs"
                    >
                      <q-item
                        clickable
                        :active="
                          this.$q.appStore.selectedTicket.id == ticket.id
                        "
                        v-ripple
                        active-class="my-menu-link"
                        @click="clickTicket(ticket)"
                      >
                        <q-item-section>
                          <q-item-label> {{ ticket.title }}</q-item-label>
                          <q-item-label caption>
                            ID:{{ ticket.id }}</q-item-label
                          >
                          <q-item-label caption>
                            ownerID:{{ ticket.ownerId }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                    </q-list>
                  </q-scroll-area>
                </q-card-section>
              </q-tab-panel>
              <q-tab-panel name="chats">
                <q-card-section>
                  <q-scroll-area style="height: 350px; max-width: 300px">
                    <q-list
                      separator
                      v-for="chat in this.$q.appStore.msgFromFreeChat"
                      :key="chat.roomId"
                      class="q-py-xs"
                    >
                      <q-item
                        clickable
                        :active="
                          chat.roomId == this.selectRoomId
                        "
                        v-ripple
                        active-class="my-menu-link"
                        @click="clickFreeChat(chat)"
                      >
                        <q-item-section>
                          <q-item-label caption> ID:{{ chat.id }}</q-item-label>
                          <q-item-label caption>
                            roomId:{{ chat.roomId }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                    </q-list>
                  </q-scroll-area>
                </q-card-section>
                <q-card-section>
                  <q-scroll-area style="height: 350px; max-width: 300px">
                  </q-scroll-area>
                </q-card-section>
              </q-tab-panel>
            </q-tab-panels>
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
      tab: ref("tickets"),
      selectRoomId: ref(null),
    };
  },

  async beforeMount() {
    await this.getData();

    await this.$q.ws.onUnpackedMessage.addListener((data) => {
      if (data.type === "notice" && data.args.action === "message") {
        // this.messages.push(data.args.args);
        this.addNewMessage(data.args.args);
        //this.newMessages.push(data.args.args);
      }
    });
  },

  mounted() {},

  methods: {
    async clickTicket(data) {
      this.$q.appStore.set({
        selectedTicket: data,
      });
      await this.getData();
    },

    async clickFreeChat(data) {

      this.messages = data;
      this.selectRoomId = data.roomId;
      console.log(this.messages, this.selectRoomId);
    },

    async getData(props) {
      if (this.loading) return;
      this.loading = true;
      this.User = this.$q.appStore.user;
      this.ticketsList = this.$q.appStore.ticketsList;


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
      if (this.tab === "tickets") {
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
      } else if (this.tab === "freechat") {
        const response = await this.$q.ws.sendRequest({
          type: "query",
          iface: "freechat",
          method: "send",
          args: {
            message: {
              ownerId: this.User.id,
              content: this.msgDataToSend,
              roomId: this.selectRoomId,
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
      }
    },

    scrollToEnd() {
      const vm = this;
      setTimeout(function () {
        vm.scrollAreaRef.setScrollPercentage("vertical", 1);
      }, 100);
    },

    async onLoad(index, done) {
      if (this.tab === "tickets") {
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
      }
      else if (this.tab === "freechat") {
        done();
      }

    },
    async addNewMessage(message) {
      this.messages.push(message);

      await nextTick(() => {
        this.scrollToEnd();
      });
    },
  },
});
</script>
<style lang="sass">
.my-menu-link
  color: white
  background: $accent
</style>
