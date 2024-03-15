<template>
  <q-page>
    <div class="container">
      <h1>Главная</h1>
      <div
        class="q-pa-md fit row wrap justify-center items-stretch content-stretch full-width" >
        <!-- для пользователей   -->
        <div class="q-pa-sm col-lg-4 col-md-12 col-xs-12" v-if="this.$q.appStore.user.roleId < 3">
          <q-card>
            <q-card-section>
              <h4>ТЕМЫ</h4>
              <div class="q-gutter-md q-pb-md">
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  label="Создать группу"
                  @click="showDialogThemeAddUpdate"
                />
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  label="Создать услугу"
                  @click="showDialogServiceAddUpdate"
                />
              </div>
              <q-list>
                <q-expansion-item
                  expand-separator
                  label="Тема"
                  caption="Выберете сервис обращения"
                >
                <ThemeItem
                  v-for="child in topLevelThemeList"
                  :theme="child"
                  :themeList="themeList"
                  :key="child.id"
                />
              </q-expansion-item>

              </q-list>
            </q-card-section>
          </q-card>
        </div>
        <!-- для всех-->
        <div class="q-pa-sm col-lg-8 col-md-12 col-xs-12 col-grow">
          <q-table
            v-if="ready"
            class="table--users"
            :grid="$q.screen.lt.md"
            color="primary"
            :rows="rows"
            @row-dblclick="handleRowDoubleClick"
            :columns="columns"
            row-key="data"
            rows-per-page-label="Количество на странице"
            :rows-per-page-options="[5]"
            binary-state-sort
            v-model:pagination="pagination"
            @request="getData"

            :loading="loading"
          >
            <template v-slot:top="props">
              <div class="table-top">
                <div class="table-top__tabs"></div>
                <div class="table-top__assets">
                  <div class="left col-xs-12">
                    <h4>ТИКЕТЫ</h4>
                  </div>
                  <div class="right col-auto">
                    <div class="q-pb-md q-pr-md" v-if="this.$q.appStore.user.roleId < 3">
                      <q-btn
                        unelevated
                        no-caps
                        color="primary"
                        label="Создать тикет"
                        @click="createTicket"
                      ></q-btn>
                    </div>
                    <div class=" q-pb-md">
                      <q-select
                        outlined
                        bg-color="white"
                        v-model="selectStatus"
                        :options="optionsStatus"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template v-slot:bottom="props">
              <div class="table-bottom">
                <div class="table-bottom__show">
                  <span>Показано:</span> <strong>1-5</strong> <span>из</span>
                  <strong>9</strong>
                </div>
                <div class="table-bottom__pagination">
                  <q-pagination
                    v-model="pagination.page"
                    color="primary"
                    :max="pagesNumber"
                    :max-pages="6"
                    direction-links
                    :ripple="false"
                  />
                </div>
              </div>
            </template>
            <template v-slot:no-data> Нет данных </template>
            <template v-slot:header-cell="props">
              <q-th :props="props" :data-field="props.col.name">
                {{ props.col.label }}
              </q-th>
            </template>
            <template v-slot:body-cell="props">
              <q-td :props="props" :data-field="props.col.name">
                {{ props.value }}
              </q-td>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>
  <dialog-theme-add-update
    :dialog="dialogThemeAddUpdate"
    @onSave="onThemeSave"
  />
  <dialog-service-add-update
  :dialog="dialogServiceAddUpdate"
    @onSave="onServiceSave"
  />
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

/// класс работы с юзером
import UserClass from "src/utils/classes/User.Class";
/// класс работы с темой
import ThemeClass from "src/utils/classes/Theme.Class";
/// класс работы с сервисом
import ServiceClass from "src/utils/classes/Service.Class";
/// диалоговое окно создания/изменения темы
import DialogThemeAddUpdate from 'components/dialogs/Theme/DialogThemeAddUpdate';
/// диалоговое окно создания/изменения сервиса
import ServiceThemeAddUpdate from 'components/dialogs/Service/DialogServiceAddUpdate';
/// компонент отображения списка тема с вложенностью
import ThemeItem from "components/ThemeItem.vue";
import DialogServiceAddUpdate from "src/components/dialogs/Service/DialogServiceAddUpdate.vue";

export default defineComponent({
  name: "IndexPage",
  components: {
    ThemeItem,
    DialogThemeAddUpdate,
    ServiceThemeAddUpdate,
    DialogServiceAddUpdate
  },
  setup() {
    const User = new UserClass();
    const Theme = new ThemeClass();
    const Service = new ServiceClass();

    const dialogThemeAddUpdateDefault = Theme.dialogAddUpdateDefault;
    const dialogServiceAddUpdateDefault = Service.dialogAddUpdateDefault;

    /** Columns */
    const columns = [
      { name: "id", label: "ID", field: "id", align: "left", sortable: true },
      {
        name: "startDateTime",
        label: "ДАТА СОЗДАНИЯ",
        field: "startDateTime",
        align: "left",
        sortable: true,
        format: (val) => {
            const date = new Date(val);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          },
      },
      {
        name: "title",
        label: "НАЗВАНИЕ",
        field: "title",
        align: "left",
        sortable: true,
      },
      {
        name: "description",
        label: "ОПИСАНИЕ",
        field: "description",
        align: "left",
        sortable: true,
      },
      {
        name: "ticketStatusId",
        label: "СТАТУС",
        field: "ticketStatusId",
        align: "left",
        sortable: true,
        format: (val)=> {
          let status = "";
          switch (val) {
              case 1:
                  status = "новый";
                  break;
              case 2:
                  status = "открыт";
                  break;
              case 3:
                  status = "закрыт";
                  break;
              case 4:
                  status = "восстановлен";
                  break;
              default:
                  status = "неизвестный статус";
                  break;
          }

          return status;
        }
      },
    ];

    /** Page query */
    const query = useRoute().query;
    const pagination = {
      page: query.page ? parseInt("" + query.page) : 1,
      rowsPerPage: query.rowsPerPage ? parseInt("" + query.rowsPerPage) : 5,
      sortBy: query.sortBy || "id",
      descending: query.descending ? query.descending === "true" : true,
      rowsNumber: 0,
    };

    const themeList = null;
    const topLevelThemeList = null;
    const serviceList = null;

    return {
      rows: ref([]),
      columns,
      pagination: ref(pagination),
      pagesNumber: ref(0),
      ready: ref(true),
      loading: ref(false),
      selectStatus: ref("Все"),
      optionsStatus: ["Все", "Новый", "Открыт", "Зыкрыт", "Восстановлен"],
      User,
      Theme,
      Service,
      themeList,
      serviceList,
      topLevelThemeList,
      dialogThemeAddUpdateDefault,
      dialogThemeAddUpdate: ref({}),
      dialogServiceAddUpdateDefault,
      dialogServiceAddUpdate: ref({}),
    };
  },

  async beforeMount() {
    await this.getData();

    // получили список тем
      const resultTakeTheme=  await this.Theme.takeTheme();
      if (!resultTakeTheme.success) {
        if (resultTakeTheme.message) {
          this.$q.dialogStore.set({
            show: true,
            title: 'Ошибка',
            html: resultTakeTheme.message,
            ok: {
              color: 'red'
            }
          });
        }
        window['splash-screen'].classList.add('ready', 'error');
        return;
      }
  },

  methods: {
    async getData(props) {
      if (this.loading) return;
      this.loading = true;
      let { page, rowsPerPage, sortBy, descending } = props
        ? props.pagination
        : this.pagination;
      this.$router.replace({
        query: {
          rowsPerPage,
          page,
          sortBy,
          descending,
        },
      });
      const response = await this.$q.ws.sendRequest({
        type: "query",
        iface: "ticket",
        method: "getList",
        args: {
         // id: this.$q.appStore.user.roleId,
          id: 18,
          limit: rowsPerPage,
          offset: (page - 1) * rowsPerPage,
          order: [[sortBy, descending ? "DESC" : "ASC"]],
          // roleId
          // limit: rowsPerPage,
          // offset: 0
        },
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
        this.$q.appStore.set({ticketList: response.args.rows});
        let answer = [];
        if ( this.$q.appStore.user.roleId <= 2) {
           answer = response.args.rows;
        }
        else if ( this.$q.appStore.user.roleId === 3) {
          //TODO заполнять для операторов.
          answer = response.args.rows; // заглушка
        }
        else if (this.$q.appStore.user.roleId === 4) {
           answer = response.args.rows.filter((row) => row.ownerId === this.$q.appStore.user.id);
        }

        console.log("answer", answer);
        this.rows = answer;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = answer.length;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagesNumber = Math.ceil(
          answer.length / this.pagination.rowsPerPage
        );
        // this.rows = response.args.rows;
        // this.pagination.page = page;
        // this.pagination.rowsPerPage = rowsPerPage;
        // this.pagination.rowsNumber = response.args.count;
        // this.pagination.sortBy = sortBy;
        // this.pagination.descending = descending;
        // this.pagesNumber = Math.ceil(
        //   response.args.count / this.pagination.rowsPerPage
        // );
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
        this.$q.appStore.set({groupsList: responseTheme.args.rows});
        this.themeList = responseTheme.args.rows;
        this.topLevelThemeList = responseTheme.args.rows.filter(
          (row) => row.parentId === null
        );
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
        this.$q.appStore.set({servicesList: responseServece.args.rows});
        this.serviceList = responseServece.args.rows;
      }

      this.ready = true;
      this.loading = false;
    },

    showDialogThemeAddUpdate () {
      const excludeFields = ['id', 'token', 'isDeleted', 'online', 'active'];
      const data = {};
      Object.keys(this.dialogThemeAddUpdateDefault.data).forEach(key => {
        if (!excludeFields.includes(key)){
          data[key] = this.dialogThemeAddUpdateDefault.data[key];
        }
      });
      this.dialogThemeAddUpdate = {
        show: true,
        method: 'add',
        onHide: () => this.dialogThemeAddUpdate = structuredClone(this.dialogThemeAddUpdateDefault),
        data
      }
    },
    onThemeSave (result) {
      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Ошибка',
          text: result.message,
          ok: {
            color: 'red'
          }
        });
      }
      else if (result.success && result.user) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Тема создана'
        });
        this.dialogThemeAddUpdate.show = false;
        this.getData();
      }
    },
    showDialogServiceAddUpdate () {
      const excludeFields = ['id', 'token', 'isDeleted', 'online', 'active'];
      const data = {};
      Object.keys(this.dialogServiceAddUpdateDefault.data).forEach(key => {
        if (!excludeFields.includes(key)){
          data[key] = this.dialogServiceAddUpdateDefault.data[key];
        }
      });
      this.dialogServiceAddUpdate = {
        show: true,
        method: 'add',
        onHide: () => this.dialogServiceAddUpdate = structuredClone(this.dialogServiceAddUpdateDefault),
        data
      };
    },
    onServiceSave (result) {
      if (!result.success) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Ошибка',
          text: result.message,
          ok: {
            color: 'red'
          }
        });
      }
      else if (result.success && result.user) {
        this.$q.dialogStore.set({
          show: true,
          title: 'Сервис создан'
        });
        this.dialogServiceAddUpdate.show = false;
        this.getData();
      }
    },
    handleRowDoubleClick(event, row) {
    // Получите данные строки и выполните переход на другую страницу
    this.$q.appStore.set({
      selectedTicket: row
    });
    this.$router.push({ path: '/tickets'});
  },
  createTicket() {
    // Получите данные строки и выполните переход на другую страницу
    this.$q.appStore.set({
      selectedTicket: null
    });
    this.$router.push({ path: '/tickets'});
  }
  },
});
</script>

<style lang="scss">
.example-row-column-width {
  .row > div {
    padding: 10px 15px;
  }
  .row + .row {
    margin-top: 1rem;
  }
}
</style>
