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
        min: 2,
        max: 300,
        rules: (val) => {
          return val && val.length >= 2 && val.length <= 30;
        },
      },
      groupId: {
        label: "id группы",
        type: "number",
        default: undefined,
        required: true,
        rules: (val) => {
          return typeof val === "number" && val > 0 || val == null;
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
    async save (method, data, dataWas) {
      // Если add
      if (method === 'add' && data) {
        const _data = structuredClone(data);
        const response = await this.$q.ws.sendRequest({
          type: 'query',
          iface: 'service',
          method: 'addGroup',
          args: {
            group: {
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
      else if (method === 'update' && data && dataWas) {
        const _data = {};
        Object.keys(data).forEach(key => {
          if(data[key] !== dataWas[key]){
            _data[key] = data[key];
          }
        });
        // Если нет никаких изменений
        if (Object.keys(_data).length === 0) {
          return {
            success: false,
            noChanges: true
          }
        }
        // Если есть изменения, то сохраняем их
        else {
          const response = await this.$q.ws.sendRequest({
            type: 'query',
            iface: 'service',
            method: 'updateGroup',
            args: {
              group: {
                id: data.id,
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
            const theme = response.args;
            return {
              success: true,
              theme
            }
          }
        }
      }
    }
}

export default Theme;
