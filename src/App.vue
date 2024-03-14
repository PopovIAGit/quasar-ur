<template>
  <router-view />
  <dialog-component/>
</template>

<script>
import { defineComponent } from 'vue'
import { useAppStore } from 'stores/app'
import { useHelperTablesStore } from 'stores/helperTables'
import { useDialogStore } from 'stores/dialog'
import WebSocketAsPromised from 'websocket-as-promised'

import DialogComponent from 'components/dialogs/DialogComponent'

import UserClass from 'src/utils/classes/User.Class'

export default defineComponent({
  name: 'App',

  components: {
    DialogComponent
  },

  setup () {
    const User = new UserClass();
    return {
      User
    }
  },

  async beforeMount () {

    /** STORES */
    this.$q.appStore = useAppStore();
    this.$q.helperTablesStore = useHelperTablesStore();
    this.$q.dialogStore = useDialogStore();

    /** WS */
    const wssServer = 'wss://sinthy.fvds.ru:3031';
    this.$q.ws = new WebSocketAsPromised(wssServer, {
      packMessage: data => JSON.stringify(data),
      unpackMessage: data => JSON.parse(data),
      attachRequestId: (data, requestId) => Object.assign({id: requestId}, data),
      extractRequestId: data => data && data.id
    });
    // Пробуем подключиться к серверу
    try {
      await this.$q.ws.open();
    }
    // Если ошибка подключения, то сообщаем и прерываем дальнейшее выполнение
    catch (e) {
      console.log(e);
      this.$q.dialogStore.set({
        show: true,
        title: 'Ошибка',
        text: 'Ошибка подключения к серверу ' + wssServer,
        ok: {
          color: 'red'
        }
      });
      window['splash-screen'].classList.add('ready', 'error');
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
            title: 'Ошибка',
            html: resultAuthAfter.message,
            ok: {
              color: 'red'
            }
          });
        }
        window['splash-screen'].classList.add('ready', 'error');
        return;
      }
    }

    this.$q.appStore.set({
      ready: true
    });

    /** SPLASH SCREEN **/
    // Убираем splash screen
    window['splash-screen'].classList.add('ready');
    setTimeout(() => {
      window['splash-screen'].classList.add('fade');
      setTimeout(() => {
        window['splash-screen'].remove();
      }, 700);
    }, 1000);


    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'person',
    //   method: 'getLog',
    //   args: {
    //
    //   }
    // });


    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'person',
    //   method: 'add',
    //   args: {
    //     person: {
    //       name: 'фывфыв',
    //       // surname: 'фывфыв',
    //       // patronymic: 'фывфыв',
    //       phone: '70000000034',
    //       // email: 'sddsd@mail.ru',
    //       password: 'password1',
    //       roleId: 3
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'person',
    //   method: 'update',
    //   args: {
    //     person: {
    //       id: 19,
    //       name: 'ddddddddddSDFSD',
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'person',
    //   method: 'delete',
    //   args: {
    //     person: {
    //       id: 19
    //     }
    //   }
    // });


    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'getGroupList',
    //   args: {
    //     limit: 3,
    //     offset: 2
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'sortGroup',
    //   args: {
    //     ids: [5, 4, 3, 2]
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'addGroup',
    //   args: {
    //     group: {
    //       title: 'asdfasdf'
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'updateGroup',
    //   args: {
    //     group: {
    //       id: 3,
    //       title: 'Title group id 3111'
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'removeGroup',
    //   args: {
    //     group: {
    //       id: 5
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'getList',
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'sort',
    //   args: {
    //     ids: [7, 4, 3]
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'add',
    //   args: {
    //     service: {
    //       title: 'ddddddddddd22asfd',
    //       groupId: 5
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'update',
    //   args: {
    //     service: {
    //       id: 3,
    //       title: 'Title service id 32344'
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'service',
    //   method: 'remove',
    //   args: {
    //     service: {
    //       id: 8
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'message',
    //   method: 'getList',
    //   args: {
    //     limit: 3,
    //     offset: 2
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'message',
    //   method: 'update',
    //   args: {
    //     message: {
    //       id: 55,
    //       content: '23hgasd8t34g'
    //     }
    //   }
    // });

    // this.$q.ws.sendRequest({
    //   type: 'query',
    //   iface: 'message',
    //   method: 'remove',
    //   args: {
    //     message: {
    //       id: 49
    //     }
    //   }
    // });

  },

  methods: {
    test () {
      this.$q.ws.sendRequest({
        type: 'query',
        iface: 'message',
        method: 'send',
        args: {
          message: {
            ownerId: 1,
            content: 'Текст сообщения',
            ticketId: 17,
            sentDateTime : new Date(),
          }
        }
      });
    }
  }
})
</script>
