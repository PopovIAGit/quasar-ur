<template>
  <div class="login-window row justify-center content-center">
    <div
      class="q-gutter-sm q-pb-md row justify-center col-lg-4 col-md-4 col-xs-12"
    >
      <q-form @submit="onSubmit">
        <div class="q-mb-md">
          <div class="label">Телефон</div>
          <!-- Телефон -->
          <q-input
            outlined
            bg-color="white"
            hide-bottom-space
            v-model="phone"
            prefix="+7"
            :mask="User.fields.phone.mask"
            unmasked-value
            :min="User.fields.phone.min"
            :max="User.fields.phone.max"
            required
            :rules="[(val) => User.fields.phone.rules(val)]"
          >
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </div>
        <!-- Пароль -->
        <div class="q-mb-md">
          <div class="label">
            {{ User.fields.password.label }}
            {{ User.fields.password.required ? "*" : "" }}
          </div>
          <q-input
            outlined
            bg-color="white"
            hide-bottom-space
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :min="User.fields.password.min"
            :max="User.fields.password.max"
            :required="User.fields.password.required"
            :rules="[(val) => User.fields.password.rules(val)]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>
        <div class="q-mb-lg row justify-between items-center">
          <q-checkbox v-model="remember" label="Запомнить" />
          <span class="text-primary cursor-pointer">Забыли пароль?</span>
        </div>
        <q-btn
          unelevated
          no-caps
          color="primary"
          class="full-width"
          type="submit"
          label="Войти"
        />
      </q-form>
    </div>

    <div
      class="q-gutter-sm q-pb-sm row justify-center col-lg-4 col-md-4 col-xs-12"
    >
      <div style="max-width: 800px">
        <q-card style="min-width: 320px">
          <q-card-section class="row q-dialog__header">
            <div class="text-grey">Свободный чат - пишите кто хочет</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <q-scroll-area
              style="height: 400px; max-height: 750px"
              ref="scrollAreaRef"
            >
              <div class="row justify-evenly q-pa-md">
                <div style="width: 100%; max-width: 800px">
                  <q-chat-message
                    v-for="(message, key) in messages"
                    :key="key"
                    :name="
                      message.ownerId == this.freeUserId
                        ? this.freeUserId
                        : message.ownerId
                    "
                    :text="[message.content]"
                    :sent="message.ownerId == this.freeUserId ? true : false"
                  />
                </div>
              </div>
              <template v-slot:loading>
                <div class="row justify-center q-my-md">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
              </template>
            </q-scroll-area>
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
              :rules="[
                (val) => val.trim().length !== 0 && !val.includes('\\n'),
              ]"
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
</template>

<script>
import { defineComponent, ref, nextTick } from "vue";

import UserClass from "src/utils/classes/User.Class";

export default defineComponent({
  name: "LoginWindow",

  setup() {
    const User = new UserClass();

    const freeUserId = (Math.floor(Math.random() * 10000) + 100).toString();
    const roomId = freeUserId;
    return {
      User,
      // Form fields
      phone: ref("0000000000"),
      password: ref("super"),
      remember: ref(false),
      // Show password
      showPassword: ref(false),
      msgDataToSend: ref(""),
      freeUserId,
      roomId,
      messages: ref([]),
      scrollAreaRef: ref(null),
    };
  },

  async beforeMount() {
    window.addEventListener("beforeunload", () => {
      /// TODO: тут нужно удалять фричат
      const response = this.$q.ws.sendRequest({
        type: "query",
        iface: "freechat",
        method: "send",
        args: {
          message: {
            ownerId: this.freeUserId,
            content: "!msg to destroy room!",
            roomId: this.roomId,
            sentDateTime: new Date(),
          },
        },
      });

      if (response.type === "error") {
        console.error("error", response.args);
      }
      this.$q.freeChat.delitRoom(this.freeUserId);
    });

    await this.$q.ws.onUnpackedMessage.addListener((data) => {
      if (data.type === "notice" && data.args.action === "freechatMessage") {
        if (data.args.args.message.roomId == this.roomId) {
          this.addNewMessage(data.args.args.message);
        }
      }
    });
  },

  methods: {
    async onSubmit() {
      const result = await this.User.login({
        phone: this.phone,
        password: this.password,
      });
      // Если ошибка логина TODO
      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: result.message,
          ok: {
            color: "red",
          },
        });
      }
      // Если успешный логин
      else if (result.success) {
        this.$q.freeChat.delitRoom(this.freeUserId);
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
        }
      }
    },
    async sendMsg() {
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "freechat",
        method: "send",
        args: {
          message: {
            ownerId: this.freeUserId,
            roomId: this.roomId,
            content: this.msgDataToSend,
            sentDateTime: new Date(),
          },
        },
      });
      if (response.type === "error") {
        console.error("error", response.args);
      } else if (response.type === "answer") {
        this.addNewMessage({
          ownerId: this.freeUserId,
          roomId: this.roomId,
          content: this.msgDataToSend,
          sentDateTime: new Date(),
        });
        this.msgDataToSend = "";
      }
      await nextTick(() => {
        this.scrollToEnd();
      });
    },
    ///
    async addNewMessage(message) {
      this.messages.push(message);
      console.log("addNewMessage", message);
      this.$q.freeChat.addMsgToRoom(
        message.ownerId,
        message.roomId,
        message.content
      );
      await nextTick(() => {
        this.scrollToEnd();
      });
    },

    scrollToEnd() {
      const vm = this;
      setTimeout(function () {
        vm.scrollAreaRef.setScrollPercentage("vertical", 1);
      }, 100);
    },
    async onLoad(index, done) {
      setTimeout(() => {
        if (index > 1) {
          done();
        } else {
          done();
        }
      }, 1000);
    },
  },
});
</script>
