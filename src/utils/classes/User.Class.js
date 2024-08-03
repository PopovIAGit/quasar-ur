import { useQuasar } from "quasar";

class User {
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
      name: {
        label: "Имя",
        type: "string",
        default: "",
        min: 2,
        max: 30,
        required: true,
        rules: (val) => {
          return val && val.length >= 2 && val.length <= 30;
        },
      },
      surname: {
        label: "Фамилия",
        type: "string",
        default: "",
        min: 0,
        max: 30,
        rules: (val) => {
          return val && val.length >= 0 && val.length <= 30;
        },
      },
      patronymic: {
        label: "Отчество",
        type: "string",
        default: "",
        min: 0,
        max: 30,
        rules: (val) => {
          return val && val.length >= 0 && val.length <= 30;
        },
      },
      email: {
        label: "Email",
        type: "string",
        default: "",
        min: 5,
        max: 100,
        rules: (val) => {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val);
        },
      },
      phone: {
        label: "Телефон",
        type: "string",
        default: "",
        mask: "(###) ###-####",
        min: 10,
        max: 10,
        required: true,
        rules: (val) => {
          return val && val && val.length === 10;
        },
      },
      password: {
        label: "Пароль",
        type: "string",
        default: "",
        min: 3,
        max: 20,
        required: true,
        rules: (val) => {
          return val && val.length >= 3 && val.length <= 20;
        },
      },
      password2: {
        label: "Повтор пароля",
        type: "string",
        default: "",
        min: 3,
        max: 20,
        required: true,
        rules: (val) => {
          return val && val.length >= 3 && val.length <= 20;
        },
      },
      roleId: {
        label: "Роль",
        type: "number",
        default: undefined,
        required: true,
        rules: (val) => {
          return typeof val === "number" && val > 0;
        },
      },
      token: {
        label: "Токен",
        type: "string",
        default: "",
        rules: (val) => {
          return val && val.length === 36;
        },
      },
      online: {
        label: "Онлайн",
        type: "boolean",
        default: false,
        rules: (val) => {
          return typeof val === "boolean";
        },
      },
      active: {
        label: "Активен",
        type: "boolean",
        default: false,
        rules: (val) => {
          return typeof val === "boolean";
        },
      },
      isDeleted: {
        label: "Удален",
        type: "boolean",
        default: false,
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
   * Логин пользователя
   * @param data
   * @return {Promise<{success: boolean, message: string}|{success: boolean, user: *}|{success: boolean}>}
   */
  async login(data) {
    // Логин
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "person",
      method: "login",
      args: {
        person: {
          phone: data.phone.replace(/\D/g, ""),
          password: data.password,
        },
      },
    });
    console.log(response);
    // Если ошибка логина
    if (response.type === "error") {
      // На всякий случай удаляем токен из localStorage
      localStorage.removeItem("token");
      // На всякий случай удаляем юзера из app
      this.$q.appStore.set({
        user: null,
      });
      return {
        success: false,
        message: response.args.message || "Ошибка",
      };
    }
    // Если получен ответ от login
    else if (response.type === "answer") {
      // Если в ответе по каким-то причинам нет данных пользователя
      if (!response.args || !response.args.id || !response.args.token) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        const user = response.args;
        localStorage.setItem("token", user.token);
        this.$q.appStore.set({
          user,
        });
        return {
          success: true,
          user,
        };
      }
    }
  }

  /**
   * Логаут пользователя
   * @return {Promise<{success: boolean}>}
   */
  async logout() {
    // Логаут. Ждать ответа от сервера смысла не обнаружено.
    this.$q.ws.sendRequest({
      type: "query",
      iface: "person",
      method: "logout",
      args: null,
    });
    localStorage.removeItem("token");
    this.$q.appStore.set({
      user: null,
    });
    return {
      success: true,
    };
  }

  /**
   * Авторизация пользователя (логин с токеном)
   * @return {Promise<{success: boolean, message: string}|{success: boolean, user: *}|{success: boolean}>}
   */
  async auth() {
    let token = localStorage.getItem("token");
    if (token) console.log(token.length);
    // Если нет токена в localStorage или он некорректный
    if (!token || token.length !== 36) {
      localStorage.removeItem("token");
      this.$q.appStore.set({
        user: null,
      });
      return {
        success: false,
      };
    }
    // Авторизация с токеном
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "person",
      method: "loginWithToken",
      args: {
        person: {
          token,
        },
      },
    });
    // Если ошибка авторизации
    if (response.type === "error") {
      // На всякий случай удаляем токен из localStorage
      localStorage.removeItem("token");
      // На всякий случай удаляем юзера из app
      this.$q.appStore.set({
        user: null,
      });
      return {
        success: false,
        message: response.args.message || "Ошибка",
      };
    }
    // Если получен ответ
    else if (response.type === "answer") {
      // Если в ответе по каким-то причинам нет данных пользователя
      if (!response.args || !response.args.id || !response.args.token) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        const user = response.args;
        localStorage.setItem("token", user.token);
        this.$q.appStore.set({
          user,
        });
        return {
          success: true,
          user,
        };
      }
    }
  }

  /**
   * Действия после авторизации по логину или по токену
   * @return {Promise<{success: boolean, message: string}|{success: boolean}>}
   */
  async authAfter() {
    // Получаем статический список ролей
    const responseRoles = await this.$q.ws.sendRequest({
      type: "query",
      iface: "person",
      method: "getRoleList",
    });
    // Если ошибка получения списка ролей
    if (responseRoles.type === "error") {
      return {
        success: false,
        message:
          '<div>Ошибка получения ролей пользователей</div><div class="text-red">' +
          (response.args.message || "Ошибка") +
          "</div>",
      };
    }
    // Если получен ответ от getRoleList
    else if (responseRoles.type === "answer") {
      const roles = responseRoles.args.rows;
      const names = {
        super: "Суперадминистратор",
        administrator: "Администратор",
        operator: "Оператор",
        client: "Клиент",
      };
      roles.forEach((item) => {
        item.name = names[item["value"]];
      });
      const rolesByID = {};
      roles.forEach((item) => {
        rolesByID[item.id] = item;
      });

      this.$q.helperTablesStore.set({
        roles,
        rolesByID,
      });
      return {
        success: true,
      };
    }
  }

  /**
   * Сохранение пользователя (add или update)
   * @param method
   * @param data
   * @param dataWas
   * @return {Promise<{success: boolean, message: string}|{success: boolean, user: *}|{success: boolean, noChanges: boolean}>}
   */
  async save(method, data, dataWas) {
    // Если add
    if (method === "add" && data) {
      const _data = structuredClone(data);
      delete _data.password2;
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "person",
        method: "add",
        args: {
          person: {
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
        const user = response.args;
        return {
          success: true,
          user,
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
          iface: "person",
          method: "update",
          args: {
            person: {
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
          const user = response.args;
          return {
            success: true,
            user,
          };
        }
      }
    }
  }

  async remove(personId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "person",
      method: "remove",
      args: {
        person: {
          id: personId,
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
      if (!response.args || !response.args.id || !response.args.token) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        return {
          success: true,
        };
      }
    }
  }

  async delete(personId) {
    const response = await this.$q.ws.sendRequest({
      type: "query",
      iface: "person",
      method: "delete",
      args: {
        person: {
          id: personId,
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
      if (!response.args || !response.args.id || !response.args.token) {
        return {
          success: false,
        };
      }
      // Если всё ОК
      else {
        return {
          success: true,
        };
      }
    }
  }
}

export default User;
