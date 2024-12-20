import { useQuasar } from "quasar";

class Service {
  constructor() {
    this.$q = useQuasar();

    // DB fields
    this.fields = {
      id: {
        label: "ID",
        type: "number",
        default: undefined,
        index: true,
        rules: (val) => {
          return val !== null && typeof val === "number";
        },
      },
      title: {
        label: "Заголовок",
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
          return val && val.length >= 0 && val.length <= 3000;
        },
      },
      groupId: {
        label: "Родительская группа",
        type: "number",
        default: undefined,
        required: true,
        rules: (val) => {
          return typeof val === "number" && val > 0;
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
   * @param method add/update
   * @param data now data
   * @param dataWas data was
   * @return {Promise<{success: boolean, message: string}|{success: boolean, user: *}|{success: boolean, noChanges: boolean}>}
   */
  async save(method, data, dataWas) {
    // Если add
    if (method === "add" && data) {
      const _data = structuredClone(data);
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "service",
        method: "add",
        args: {
          service: {
            ..._data,
          },
        },
      });
      // Если ошибка сохранения
      if (response.type === "error") {
        return {
          success: false,
          message: response.args.message || "Ошибка",
        };
      }
      // Если всё ОК
      else if (response.type === "answer") {
        const service = response.args;
        return {
          success: true,
          service,
        };
      }
    }
    // Если update и переданы data и dataWas для сравнения
    else if (method === "update" && data && dataWas) {
      const _data = {};
      Object.keys(data).forEach((key) => {
        if (data[key] !== dataWas[key]) {
          _data[key] = data[key];
        }
      });
      // Если нет никаких изменений
      if (Object.keys(_data).length === 0) {
        return {
          success: false,
          noChanges: true,
        };
      }
      // Если есть изменения, то сохраняем их
      else {
        const response = await this.$q.ws.sendRequest({
          type: "query",
          iface: "service",
          method: "update",
          args: {
            service: {
              id: data.id,
              ..._data,
            },
          },
        });
        // Если ошибка сохранения
        if (response.type === "error") {
          return {
            success: false,
            message: response.args.message || "Ошибка",
          };
        }
        // Если всё ОК
        else if (response.type === "answer") {
          const service = response.args;
          return {
            success: true,
            service,
          };
        }
      }
    }
  }

  /**
   * Удаление сервиса
   * @param {*} serviceId
   * @returns
   */
  async remove(serviceId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "remove",
      args: {
        service: {
          id: serviceId,
        },
      },
    });

    // Если ошибка удаления
    if (response.type === "error") {
      return {
        success: false,
        message: response.args.message || "Ошибка",
      };
    }
    // Если получен ответ от login
    else if (response.type === "answer") {
      return {
        success: true,
      };
    }
  }
}

export default Service;
