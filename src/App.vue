<template>
  <router-view />
  <dialog-component />
</template>

<script>
import { defineComponent } from "vue";
import { useAppStore } from "stores/app";
import { useHelperTablesStore } from "stores/helperTables";
import { useDialogStore } from "stores/dialog";
import { useFreeChatStore } from "stores/freeChat";
import WebSocketAsPromised from "websocket-as-promised";

import DialogComponent from "components/dialogs/DialogComponent";

import UserClass from "src/utils/classes/User.Class";
import { QInnerLoading } from "quasar";

export default defineComponent({
  name: "App",

  components: {
    DialogComponent,
  },

  setup() {
    const User = new UserClass();
    return {
      User,
    };
  },

  async beforeMount() {
    /** STORES */
    this.$q.appStore = useAppStore();
    this.$q.helperTablesStore = useHelperTablesStore();
    this.$q.dialogStore = useDialogStore();
    this.$q.freeChat = useFreeChatStore();

    this.$q.freeChat.delitRoom(null);
    /** WS */
    const wssServer = "wss://sinthy.fvds.ru:3031";
    this.$q.ws = new WebSocketAsPromised(wssServer, {
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data),
      attachRequestId: (data, requestId) =>
        Object.assign({ id: requestId }, data),
      extractRequestId: (data) => data && data.id,
    });
    // Пробуем подключиться к серверу
    try {
      await this.$q.ws.open();
    } catch (e) {
      // Если ошибка подключения, то сообщаем и прерываем дальнейшее выполнение
      console.log(e);
      this.$q.dialogStore.set({
        show: true,
        title: "Ошибка",
        text: "Ошибка подключения к серверу " + wssServer,
        ok: {
          color: "red",
        },
      });
      window["splash-screen"].classList.add("ready", "error");
      return;
    }

    /** AUTH */
    const resultAuth = await this.User.auth();
    // Если не авторизовались
    if (!resultAuth.success) {
      // Ничего не делаем
    }
    // Если авторизованы
    else {
      // Выполняем подготовительные действия, доступные только после успешной авторизации
      const resultAuthAfter = await this.User.authAfter();
      // Если ошибка
      if (!resultAuthAfter.success) {
        if (resultAuthAfter.message) {
          this.$q.dialogStore.set({
            show: true,
            title: "Ошибка",
            html: resultAuthAfter.message,
            ok: {
              color: "red",
            },
          });
        }
        window["splash-screen"].classList.add("ready", "error");
        return;
      }
      /** Получаем все списки данных для работы **/
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "ticket",
        method: "getList",
        args: {},
      });
      // Если ошибка получения списка тикетов
      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка тикетов",
          ok: {
            color: "red",
          },
        });
      }
      // Если получен список тикетов
      else if (response.type === "answer") {
        this.$q.appStore.set({ ticketsList: response.args.rows });
      }

      const responseTheme = await this.$q.ws.sendRequest({
        type: "query",
        iface: "service",
        method: "getGroupList",
        args: {},
      });

      if (responseTheme.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка груп",
          ok: {
            color: "red",
          },
        });
      } else if (responseTheme.type === "answer") {
        this.$q.appStore.set({ groupsList: responseTheme.args.rows });
      }

      const responseServece = await this.$q.ws.sendRequest({
        type: "query",
        iface: "service",
        method: "getList",
        args: {},
      });
      if (responseServece.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка сервисов",
          ok: {
            color: "red",
          },
        });
      } else if (responseServece.type === "answer") {
        this.$q.appStore.set({ servicesList: responseServece.args.rows });
      }

      const responseUser = await this.$q.ws.sendRequest({
        type: "query",
        iface: "person",
        method: "getList",
        args: {},
      });
      // Если ошибка получения списка пользователей
      if (responseUser.type === "error") {
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
      else if (responseUser.type === "answer") {
        this.$q.appStore.set({ usersList: responseUser.args.rows });
      }
    }

    await this.$q.ws.onUnpackedMessage.addListener((data) => {
      if (
        data.type === "notice" &&
        data.args.action !== "freechatMessage" &&
        this.$q.appStore.user
      ) {
        console.log("data.args", data.args);
        this.$q.notify({
          message: data.args.action,
          position: "top",
          timeout: 3000,
          textColor: "white",
          actions: [{ icon: "close", color: "white" }],
        });
      }
      if (data.type === "notice" && data.args.action === "freechatMessage") {
        if (data.args.args.message.content === "!msg to destroy room!") {
          this.$q.freeChat.delitRoom(data.args.args.message.ownerId);
        } else {
          this.$q.freeChat.addMsgToRoom(
            data.args.args.message.ownerId,
            data.args.args.message.roomId,
            data.args.args.message.content
          );
        }
      }
    });

    this.$q.appStore.set({
      ready: true,
    });

    /** SPLASH SCREEN **/
    // Убираем splash screen
    window["splash-screen"].classList.add("ready");
    setTimeout(() => {
      window["splash-screen"].classList.add("fade");
      setTimeout(() => {
        window["splash-screen"].remove();
      }, 700);
    }, 1000);
  },

  methods: {
    test() {
      this.$q.ws.sendRequest({
        type: "query",
        iface: "message",
        method: "send",
        args: {
          message: {
            ownerId: 1,
            content: "Текст сообщения",
            ticketId: 17,
            sentDateTime: new Date(),
          },
        },
      });
    },
  },
});
</script>
