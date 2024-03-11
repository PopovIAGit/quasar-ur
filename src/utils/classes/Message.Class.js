import { useQuasar } from "quasar";

class Message {
  constructor() {
    this.$q = useQuasar();

    // DB fields
    this.fields = {
      id: {
        label: "ID сообщения",
        type: "number",
        default: undefined,
        index: true,
        rules: (val) => {
          return val !== null && typeof val === "number";
        },
      },
      content: {
        label: "Текст сообщения",
        type: "string",
        default: "",
        min: 2,
        max: 300,
        required: true,
        rules: (val) => {
          return val && val.length >= 2 && val.length <= 300;
        },
      },
      description: {
        label: "Описание",
        type: "string",
        default: "",
        min: 2,
        max: 3000,
        rules: (val) => {
          return val && val.length >= 2 && val.length <= 3000;
        },
      },
      sentDateTime: {
        label: "Время отпраки сообщения",
        type: "number",
        default: undefined,
        required: true,
        rules: (val) => {
          return typeof val === "number" && val > 0;
        },
      },
      getDateTime: {
        label: "Время получения сообщения",
        type: "number",
        default: undefined,
        required: true,
        rules: (val) => {
          return typeof val === "number" && val > 0;
        },
      },
      isDeleted: {
        label: 'Удален',
        type: 'boolean',
        default: false,
        rules: (val) => {
          return typeof val === 'boolean';
        }
      },
      messageStatusId: {
        label: "Статус сообщения",
        type: "number",
        default: undefined,
        index: true,
        rules: (val) => {
          return val !== null && typeof val === "number";
        },
      },
      ownerID: {
        label: "ID создателя",
        type: "number",
        default: undefined,
        index: true,
        rules: (val) => {
          return val !== null && typeof val === "number";
        },
      },
      ticketID: {
        label: "ID тикета",
        type: "number",
        default: undefined,
        index: true,
        rules: (val) => {
          return val !== null && typeof val === "number";
        },
      },
    };

    // Dialog add/update
    this.dialogAddUpdateDefault = {
      show: false,
      method: undefined,
      onHide: undefined,
      dataWas: {
        ...Object.assign(
          {},
          ...Object.entries(this.fields).map(([k, v]) => ({ [k]: v.default }))
        ),
      },
      data: {
        ...Object.assign(
          {},
          ...Object.entries(this.fields).map(([k, v]) => ({ [k]: v.default }))
        ),
      },
    };
  }

    /**
   * Сохранение тикета (add или update)
   * @param method
   * @param data
   * @param dataWas
   * @return {Promise<{success: boolean, message: string}|{success: boolean, user: *}|{success: boolean, noChanges: boolean}>}
   */
  async send (method, data, dataWas) {
    // Если add
    if (method === 'add' && data) {
      const _data = structuredClone(data);
      const response = await this.$q.ws.sendRequest({
        type: 'query',
        iface: 'service',
        method: 'add',
        args: {
          service: {
            ..._data
          }
        }
      });
      // Если ошибка сохранения
      if (response.type === 'error') {
        return {
          success: false,
          message: response.args.message || 'Ошибка'
        }
      }
      // Если всё ОК
      else if (response.type === 'answer') {
        const user = response.args;
        return {
          success: true,
          user
        }
      }
    }
    // Если update и переданы data и dataWas для сравнения
  }
  async remove (messageId){
    const response = await this.$q.ws.sendRequest({
      type: 'query',
      iface: 'message',
      method: 'remove',
      args: {
        message: {
          id: messageId
        }
      }
    });

        // Если ошибка удаления
        if (response.type === 'error') {
          return {
            success: false,
            message: response.args.message || 'Ошибка'
          }
        }
        // Если получен ответ от login
        else if (response.type === 'answer') {
          // Если в ответе по каким-то причинам нет данных пользователя
          if (!response.args || !response.args.id || !response.args.token) {
            return {
              success: false
            }
          }
          // Если всё ОК
          else {
            return {
              success: true,
            }
          }
        }
  }
}

export default Tiket;
