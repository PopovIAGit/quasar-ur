import { useQuasar } from "quasar";

class Theme {
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
        max: 30,
        required: true,
        rules: (val) => {
          return val && val.length >= 2 && val.length <= 30;
        },
      },
      description: {
        label: "Описание",
        type: "string",
        default: "",
        min: 0,
        max: 300,
        rules: (val) => {
          return val && val.length >= 0 && val.length <= 300;
        },
      },
      parentId: {
        label: "Родительская группа",
        type: "number",
        default: undefined,
        required: true,
        rules: (val) => {
          return (typeof val === "number" && val > 0) || val === null;
        },
      },
      hidden: {
        label: "Скрытая группа",
        type: "boolean",
        default: false,
        required: false,
        rules: (val) => {
          return typeof val === "boolean";
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
   * Сохранение темы (add или update)
   * @param method
   * @param data
   * @param dataWas
   * @return {Promise<{success: boolean, message: string}|{success: boolean, user: *}|{success: boolean, noChanges: boolean}>}
   */
  async addGroup(method, data, dataWas) {
    // Если add
    if (method === "add" && data) {
      const _data = structuredClone(data);
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "service",
        method: "addGroup",
        args: {
          group: {
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
        const group = response.args;
        return {
          success: true,
          group,
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
          method: "updateGroup",
          args: {
            group: {
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
          const group = response.args;
          return {
            success: true,
            group,
          };
        }
      }
    }
  }

  async getGroupList() {
    const responseTheme = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "getGroupList",
      args: {},
    });
    // Если ошибка получения getGroupList
    if (responseTheme.type === "error") {
      return {
        success: false,
        message:
          '<div>Ошибка получения getGroupList</div><div class="text-red">' +
          (response.args.message || "Ошибка") +
          "</div>",
      };
    }
    // Если получен ответ от getGroupList
    else if (responseTheme.type === "answer") {
      const groupList = responseTheme.args.rows;
      const themeTitles = groupList.map((obj) => obj.title);

      this.$q.helperTablesStore.set({
        themeTitles,
      });
      return {
        success: true,
      };
    }
  }
  async removeGroup(groupId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "removeGroup",
      args: {
        group: {
          id: groupId,
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
    // Если получен ответ от
    else if (response.type === "answer") {
      return {
        success: true,
      };
    }
  }
  async sortGroup(ids) {
    if (!Array.isArray(ids)) {
      throw new Error("ids must be an array");
    }
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "sortGroup",
      args: {
        ids: ids,
      },
    });
  }

  async addGroupAccessList(groupId, userId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "addGroupAccessList",
      args: {
        acl: {
          personId: userId,
          servicesGroupId: groupId,
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
      // Если в ответе по каким-то причинам нет данных пользователя
      if (!response.args || !response.args.id) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        const group = response.args;
        return {
          success: true,
          group,
        };
      }
    }
  }
  async removeGroupAccessList(groupId, userId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "removeGroupAccessList",
      args: {
        acl: {
          personId: userId,
          servicesGroupId: groupId,
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
      // Если в ответе по каким-то причинам нет данных
      if (!response.args) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        const group = response.args;
        return {
          success: true,
          group,
        };
      }
    }
  }

  async addHiddenGroupAccessList(groupId, userId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "addHiddenGroupAccessList",
      args: {
        acl: {
          personId: userId,
          servicesGroupId: groupId,
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
      // Если в ответе по каким-то причинам нет данных
      if (!response.args || !response.args.id) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        const group = response.args;
        return {
          success: true,
          group,
        };
      }
    }
  }

  async removeHiddenGroupAccessList(groupId, userId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "service",
      method: "removeHiddenGroupAccessList",
      args: {
        acl: {
          personId: userId,
          servicesGroupId: groupId,
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
      // Если в ответе по каким-то причинам нет данных
      if (!response.args) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        const group = response.args;
        return {
          success: true,
          group,
        };
      }
    }
  }
}

export default Theme;
