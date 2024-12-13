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
                Выбранный тикет:
                {{
                  this.$q.appStore.selectedTicket !== null
                    ? this.$q.appStore.selectedTicket.id
                    : "тикет не выбран"
                }}
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
                              : this.nameOfAuthors.find(
                                  (obj) => obj.id == message.ownerId
                                ).name
                          "
                          :stamp="message.ticketId"
                          :text="[message.content]"
                          :sent="message.ownerId == this.User.id ? true : false"
                        />
                      </div>
                      <div v-if="this.tab == 'freechat'">
                        <q-chat-message
                          v-for="(freeMessage, id) in freeMessages"
                          :key="id"
                          :name="
                            freeMessage.ownerId === this.User.id
                              ? this.User.name
                              : this.$q.appStore.usersList.find(
                                  (obj) => obj.id === freeMessage.ownerId
                                )?.name || freeMessage.ownerId
                          "
                          :text="[freeMessage.content]"
                          :sent="
                            freeMessage.ownerId == this.User.name ? true : false
                          "
                        />
                      </div>
                      <div v-if="this.tab == 'freechatAll'">
                        <q-chat-message
                          v-for="(freeMessageAll, id) in freeMessagesAll"
                          :key="id"
                          :name="
                            (user = this.$q.appStore.usersList.find(
                              (obj) => obj.id == freeMessageAll.ownerId
                            ))
                              ? user.name
                              : freeMessageAll.ownerId
                          "
                          :text="[freeMessageAll.message]"
                          :sent="
                            freeMessageAll.ownerId == this.User.id
                              ? true
                              : false
                          "
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
                :disable="
                  this.ticketsList.length == 0 &&
                  this.$q.appStore.user.roleId == 4
                "
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
              <q-tab
                name="freechat"
                icon="question_answer"
                label="Free Chat"
                v-if="this.$q.appStore.user.roleId < 4"
              >
                <q-badge color="primary" text-color="white" floating>{{
                  this.msgFromFreeChat.length
                }}</q-badge>
              </q-tab>
              <q-tab
                name="freechatAll"
                icon="question_answer"
                label="Free History"
                v-if="this.$q.appStore.user.roleId < 3"
              >
              </q-tab>
            </q-tabs>
            <q-tab-panels v-model="tab" animated class="q-pa-none">
              <q-tab-panel name="tickets" class="q-pa-none">
                <div class="q-pa-xs">
                  <q-scroll-area
                    style="height: 200px; max-width: 300px"
                    class="q-pa-none"
                  >
                    <q-list
                      separator
                      v-for="ticket in ticketsList"
                      :key="ticket.id"
                      class="q-py-xs"
                    >
                      <q-item
                        clickable
                        :active="
                          this.$q.appStore.selectedTicket !== null
                            ? this.$q.appStore.selectedTicket.id == ticket.id
                            : false
                        "
                        v-ripple
                        active-class="my-menu-link"
                        @click="clickTicket(ticket)"
                        class="q-pa-none"
                      >
                        <q-item-section>
                          <q-item-label> {{ ticket.title }}</q-item-label>
                          <q-item-label caption>
                            ID тикета: {{ ticket.id }}</q-item-label
                          >
                          <q-item-label caption>
                            Владелец:
                            {{
                              this.$q.appStore.usersList.find(
                                (obj) => obj.id == ticket.ownerId
                              )?.name || ticket.ownerId
                            }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                    </q-list>
                  </q-scroll-area>
                </div>
              </q-tab-panel>
              <q-tab-panel
                class="q-pa-none"
                name="freechat"
                v-if="this.$q.appStore.user.roleId < 3"
              >
                <q-card-section>
                  <q-scroll-area style="height: 350px; max-width: 300px">
                    <q-list
                      separator
                      v-for="room in this.msgFromFreeChat"
                      :key="room.roomId"
                      class="q-py-xs"
                    >
                      <q-item
                        clickable
                        :active="room.roomId == this.selectRoomId"
                        v-ripple
                        active-class="my-menu-link"
                        @click="clickFreeChat(room)"
                      >
                        <q-item-section>
                          <q-item-label caption>
                            roomId:{{ room.roomId }}</q-item-label
                          >
                        </q-item-section>
                      </q-item>
                      <q-separator />
                    </q-list>
                  </q-scroll-area>
                </q-card-section>
              </q-tab-panel>
              <q-tab-panel name="freechatAll" class="q-pa-none">
                <q-card-section>
                  <q-scroll-area style="height: 350px; max-width: 300px">
                  </q-scroll-area>
                </q-card-section>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
          <!-- Файлы тикета -->
          <q-card
            style="min-width: 320px"
            class="q-mt-md"
            v-if="tab == 'tickets'"
          >
            <div class="row q-pa-xs">
              <div class="q-dialog__title text-left col">Файлы тикета</div>
              <q-btn @click="uploadTicketFile" icon="attach_file" round flat />
            </div>
            <q-separator />
            <q-scroll-area style="height: 260px">
              <q-list separator>
                <q-item
                  v-for="(option, index) in this.ticketFileList"
                  :key="index"
                  class="q-my-sm"
                  clickable
                  v-ripple
                  @click="downloadTicketSelectedFile(option)"
                >
                  <q-item-section>{{ option.fileName }}</q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
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
import { storeToRefs } from "pinia";
import { useFreeChatStore } from "stores/freeChat";
import Buffer from "vue-buffer";

export default defineComponent({
  name: "ChatPage",

  setup() {
    //
    const localStore = useFreeChatStore();
    const { msgFromFreeChat } = storeToRefs(localStore);
    const selectRoomId = ref(null);

    localStore.$subscribe((mutation, state) => {
      if (
        mutation.events.newValue.roomId === selectRoomId ||
        mutation.events.newValue.ownerId === selectRoomId
      ) {
        this.scrollToEnd();
      }
    });

    return {
      ready: ref(true),
      loading: ref(false),
      msgDataToSend: ref(""),
      User: ref(null),
      messages: ref([]),
      freeMessages: ref([]),
      newMessages: ref([]),
      scrollAreaRef: ref(null),
      infinitescrollAreaRef: ref(null),
      position: ref(500),
      ticketsList: ref([]), // список тикетов
      tab: ref("tickets"), // tabs
      selectRoomId,
      msgFromFreeChat,
      localStore,
      freeMessagesAll: ref([]), // сообщения в общем чате
      nameOfAuthors: ref([]), // файлы тикета
      ticketFileList: ref([]),
    };
  },

  async beforeMount() {
    await this.getData();

    if (this.$q.appStore.selectedTicket !== null) {
      await this.getTicketFileList(this.$q.appStore.selectedTicket.id);
    }

    await this.$q.ws.onUnpackedMessage.addListener((data) => {
      if (data.type === "notice" && data.args.action === "message") {
        // this.messages.push(data.args.args);
        this.addNewMessage(data.args.args);
        //this.newMessages.push(data.args.args);
      }
    });
  },

  methods: {
    async clickTicket(data) {
      this.$q.appStore.set({
        selectedTicket: data,
      });

      await this.getTicketFileList(data.id);

      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "getList",
        args: {
          where: { ticketId: data.id },
        },
      });
      const elementsWithTicketId = response.args.rows;
      this.$q.appStore.set({ numOfMsgInTicket: elementsWithTicketId.length });

      await this.getData();
    },

    async clickFreeChat(data) {
      this.freeMessages = data.message;
      this.selectRoomId = data.roomId;
      this.scrollToEnd();
    },

    async getData(props) {
      if (this.loading) return;
      this.User = this.$q.appStore.user;
      if (this.$q.appStore.user.roleId <= 2) {
        this.ticketsList = this.$q.appStore.ticketsList;
      } else if (this.$q.appStore.user.roleId === 3) {
        //TODO заполнять для операторов.
        this.ticketsList = this.$q.appStore.ticketsList.filter(
          (row) => row.operators[0].id === this.$q.appStore.user.id
        );
      } else if (this.$q.appStore.user.roleId === 4) {
        this.ticketsList = this.$q.appStore.ticketsList.filter(
          (row) => row.ownerId === this.$q.appStore.user.id
        );
      }

      if (this.$q.appStore.selectedTicket === null) {
        return;
      }
      this.loading = true;

      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "getList",
        args: {
          where: { ticketId: this.$q.appStore.selectedTicket.id },
        },
      });

      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка cообщений",
          ok: {
            color: "red",
          },
        });
      } else if (response.type === "answer") {
        this.messages = response.args.rows.filter(
          (row) => row.ticketId === this.$q.appStore.selectedTicket.id
        );
        const filteredArray = this.messages.filter(
          (item) => item.ownerId !== this.User.id
        );
        this.nameOfAuthors = await Promise.all(
          filteredArray.map(async (item) => {
            return await this.getAuthorName(item.ownerId);
          })
        );
      }

      const responseFreeChat = await this.$q.ws.sendRequest({
        type: "query",
        iface: "freechat",
        method: "getList",
        args: {},
      });

      if (responseFreeChat.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка cообщений",
          ok: {
            color: "red",
          },
        });
      } else if (responseFreeChat.type === "answer") {
        this.freeMessagesAll = responseFreeChat.args.rows.filter(
          (row) => row.message !== "!msg to destroy room!"
        );
      }

      await nextTick(() => {
        this.scrollToEnd();
      });

      this.ready = true;
      this.loading = false;
    },

    async sendMsg() {
      if (!this.msgDataToSend) return;
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
              ownerId: this.User.name,
              content: this.msgDataToSend,
              roomId: this.selectRoomId,
              sentDateTime: new Date(),
            },
          },
        });
        if (response.type === "error") {
          console.error("error", response.args);
        } else if (response.type === "answer") {
          this.addNewFreeMessage({
            ownerId: this.$q.appStore.user.name,
            roomId: this.selectRoomId,
            content: this.msgDataToSend,
            sentDateTime: new Date(),
          });
          this.msgDataToSend = "";
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
        if (this.$q.appStore.selectedTicket === null) {
          return;
        }
        setTimeout(() => {
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
            let tmpOffset = this.$q.appStore.numOfMsgInTicket - n * index;
            tmpOffset = tmpOffset > 0 ? tmpOffset : 0;
            const response = this.$q.ws.sendRequest({
              type: "query",
              iface: "message",
              method: "getList",
              args: {
                limit: dynamicLimit,
                offset: tmpOffset,
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
      } else if (this.tab === "freechat") {
        done();
      }
    },
    async addNewMessage(message) {
      this.messages.push(message);

      if (
        message.ownerId !== this.User.id &&
        !this.nameOfAuthors.some((author) => author.id === message.ownerId)
      ) {
        const authorName = await this.getAuthorName(message.ownerId);
        this.nameOfAuthors.push(authorName);
      }

      await nextTick(() => {
        this.scrollToEnd();
      });
    },
    async addNewFreeMessage(message) {
      this.freeMessages.push(message);
      //this.$q.appStore.addMsgToRoom(message.ownerId, message.roomId, message.content);
      await nextTick(() => {
        this.scrollToEnd();
      });
    },
    async getName(message) {
      if (message.ownerId === this.User.id) {
        return this.User.name;
      } else {
        const authorName = await this.getAuthorName(message.ownerId);
        return authorName;
      }
    },
    async getAuthorName(nameId) {
      if (nameId === null || nameId === undefined) return "";

      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "person",
        method: "getList",
        args: {
          where: { id: nameId },
        },
      });

      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения имени пользователя",
          ok: {
            color: "red",
          },
        });
      } else if (response.type === "answer") {
        const rows = response.args.rows;
        if (rows.length > 0) {
          const row = rows[0];
          return row;
        }
      }
      return "";
    },
    // файл сервер
    async getTicketFileList(id) {
      /** Получаем все списки файлов **/
      const responseFileList = await this.$q.ws.sendRequest({
        type: "query",
        iface: "file",
        method: "getList",
        args: {
          where: { ticketId: id },
        },
      });

      this.ticketFileList = responseFileList.args.rows
        ? responseFileList.args.rows
        : [];

      console.log(this.ticketFileList);
      console.log(Array.isArray(this.ticketFileList));
    },
    async downloadTicketSelectedFile(file) {
      try {
        const responseFile = await this.$q.ws.sendRequest({
          type: "query",
          iface: "file",
          method: "get",
          args: {
            file: {
              id: file.id,
            },
          },
        });
        if (responseFile.type == "answer") {
          const fileData = responseFile.args;
          const buf = Buffer.from(fileData.data.data);
          // const data1 = JSON.parse(buf);
          const blob = new Blob([buf], { type: fileData.type });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileData.fileName;
          link.click();
          URL.revokeObjectURL(url);
        } else {
          console.error("Failed to download file:", responseFile);
        }
      } catch (error) {
        console.error("Error occurred while downloading file:", error);
      }
    },
    async uploadTicketFile() {
      var input = document.createElement("input");
      input.type = "file";
      let buf = null;
      let filename = null;

      input.onchange = (e) => {
        // getting a hold of the file reference
        let file = e.target.files[0];
        let preparedFile = null;
        // setting up the reader
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);

        // here we tell the reader what to do when it's done reading...
        reader.onload = (readerEvent) => {
          let arrBuf = readerEvent.target.result; // this is the content as ArrayBuffer
          // Convert ArrayBuffer to Buffer
          buf = Buffer.from(arrBuf);
          filename = file.name;
          this.sendFileToServer(buf, filename);
        };
      };
      input.click();
    },
    async sendFileToServer(buf, filename) {
      // Send the prepared file to the server
      let rand;
      const responseUploadFile = await this.$q.ws.sendRequest({
        type: "query",
        iface: "file",
        method: "add",
        args: {
          file: {
            ownerId: this.$q.appStore.user.id,
            ticketId: this.$q.appStore.selectedTicket.id,
            fileName: filename,
            data: buf,
          },
        },
      });
      this.getTicketFileList(this.$q.appStore.selectedTicket.id);
    },
  },
});
</script>
<style lang="sass">
.my-menu-link
  color: white
  background: $accent
</style>
