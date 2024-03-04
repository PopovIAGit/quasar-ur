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
        <div style="max-width: 800px;" class="col-9">
          <q-card style="min-width: 320px;">
            <q-card-section class="row q-dialog__header">
              <q-btn icon="chevron_left" dense flat to="/" unelevated no-caps />
              <div class="text-grey">{{ User.name + " " + User.surname }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <!--    <q-infinite-scroll @load="onLoad" :offset="250" reverse>
                  <q-chat-message
                      v-for="(message,key) in messages"
                      :key="key"
                      :name="message.ownerId.toString()"
                      :text="[message.content]"
                      :sent="
                        message.ownerId == this.$q.appStore.user.id ? true : false
                      "
                    />
            </q-infinite-scroll>-->

              <q-scroll-area
                style="height: 400px; max-height: 750px"
                ref="scrollAreaRef"
              >
                <div class="row justify-evenly q-pa-md">
                  <div style="width: 100%; max-width: 800px">
                    <q-chat-message
                      v-for="message in messages"
                      :key="message.id"
                      :name="message.ownerId.toString()"
                      :text="[message.content]"
                      :sent="
                        message.ownerId == this.$q.appStore.user.id
                          ? true
                          : false
                      "
                    />
                  </div>
                </div>
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
    const items = ref([{}, {}, {}, {}, {}, {}, {}]);
    return {
      ready: ref(true),
      loading: ref(false),
      msgDataToSend: ref(""),
      User: ref(null),
      messages: ref([]),
      newMessages: ref([]),
      scrollAreaRef: ref(null),
      position: ref(500),
      items,
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
        // this.messages.sort((a, b) => b.id - a.id);
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
            ownerId: this.$q.appStore.user.id,
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

    onLoad(index, done) {
      // if (this.newMessages.length !=0)
      // {
      //   console.log("this.newMessages",this.newMessages);
      //   this.messages.push(this.newMessages);
      //   this.newMessages.length = 0;
      //   done();
      // }
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
