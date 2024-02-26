<template>
  <q-page>
    <div class="container">
      <h1>Главная</h1>
      <div
        class="q-pa-md fit row wrap justify-center items-stretch content-stretch full-width" >
        <!-- для пользователей   v-if="User.roleId == 3"-->
        <div class="q-pa-sm col-lg-3 col-md-12 col-xs-12">
          <q-card>
            <q-card-section>
              <h4>ТЕМЫ</h4>
              <div class="q-gutter-md q-pb-md">
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  label="Создать тикет"
                />
              </div>
              <!-- выбор темы если есть только 3 уровня вложенности
             <q-list bordered class="rounded-borders">
                <q-expansion-item
                  expand-separator
                  label="Тема"
                  caption="Выберете тему обращения"
                >
                  <template v-slot:default>
                    <q-list>
                      <template v-for="item in topLevelThemeList">
                        <template v-if="hasChildren(item)">
                          <q-expansion-item
                            :key="item.id"
                            :label="item.title"
                            :caption="item.description"
                          >
                            <template v-slot:header>
                              <q-item-section>
                                <q-item-label>
                                  {{ item.title }}
                                </q-item-label>
                                <q-item-label caption lines="1">
                                  {{ item.description }}
                                </q-item-label>
                              </q-item-section>
                            </template>
                            <q-list>
                              <template v-for="child in getChildItems(item)">
                                <template v-if="hasChildren(child)">
                                  <q-expansion-item
                                    :header-inset-level="0.5"
                                    :key="child.id"
                                    :label="child.title"
                                    :caption="child.description"
                                  >
                                    <template v-slot:header>
                                      <q-item-section>
                                        <q-item-label>
                                          {{ child.title }}
                                        </q-item-label>
                                        <q-item-label caption lines="1">
                                          {{ child.description }}
                                        </q-item-label>
                                      </q-item-section>
                                    </template>
                                    <q-list>
                                      <template
                                        v-for="subChild in getChildItems(child)"
                                      >
                                        <template v-if="hasChildren(subChild)">
                                          <q-expansion-item
                                            :header-inset-level="1"
                                            :key="subChild.id"
                                            :label="subChild.title"
                                            :caption="subChild.description"
                                          >
                                            <template v-slot:header>
                                              <q-item-section>
                                                <q-item-label>
                                                  {{ subChild.title }}
                                                </q-item-label>
                                                <q-item-label caption lines="1">
                                                  {{ subChild.description }}
                                                </q-item-label>
                                              </q-item-section>
                                            </template>

                                          </q-expansion-item>
                                        </template>
                                        <template v-else>
                                          <q-item :key="subChild.id">
                                            <q-item-section>
                                              <q-item-label>
                                                {{ subChild.title }}
                                              </q-item-label>
                                              <q-item-label caption lines="1">
                                                {{ subChild.description }}
                                              </q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </template>
                                      </template>
                                    </q-list>
                                  </q-expansion-item>
                                </template>
                                <template v-else>
                                  <q-item :key="child.id">
                                    <q-item-section>
                                      <q-item-label>
                                        {{ child.title }}
                                      </q-item-label>
                                      <q-item-label caption lines="1">
                                        {{ child.description }}
                                      </q-item-label>
                                    </q-item-section>
                                  </q-item>
                                </template>
                              </template>
                            </q-list>
                          </q-expansion-item>
                        </template>
                        <template v-else>
                          <q-item :key="item.id">
                            <q-item-section>
                              <q-item-label>
                                {{ item.title }}
                              </q-item-label>
                              <q-item-label caption lines="1">
                                {{ item.description }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </template>
                    </q-list>
                  </template>
                </q-expansion-item>
              </q-list>-->

              <q-list>
                <q-expansion-item
                  expand-separator
                  label="Тема"
                  caption="Выберете тему обращения"
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
        <div class="q-pa-sm col-lg-9 col-md-12 col-xs-12 col-grow">
          <q-table
            v-if="ready"
            class="table--users"
            :grid="$q.screen.lt.md"
            color="primary"
            :rows="rows"
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
                    <div class="q-pb-md">
                      <q-btn
                        unelevated
                        no-caps
                        color="primary"
                        label="Создать тикет"
                        v-if="this.$q.appStore.user.roleId == 3"
                        @click="showDialogTicketAddUpdate"
                      ></q-btn>
                      <q-btn
                        unelevated
                        no-caps
                        color="primary"
                        label="Добавит тему"
                        v-if="this.$q.appStore.user.roleId < 2"
                        @click="showDialogThemeAddUpdate"
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
  <dialog-ticket-add-update
    :dialog="dialogTicketAddUpdate"
    @onSave="onTicketSave"
  />
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";

import UserClass from "src/utils/classes/User.Class";
import ThemeClass from "src/utils/classes/User.Class";
import TicketClass from "src/utils/classes/User.Class";
import ThemeItem from "components/ThemeItem.vue";
import DialogTicketAddUpdate from 'components/dialogs/ticket/DialogTicketAddUpdate'
import DialogThemeAddUpdate from 'components/dialogs/Theme/DialogThemeAddUpdate'

export default defineComponent({
  name: "IndexPage",
  components: {
    ThemeItem,
    DialogThemeAddUpdate,
    DialogTicketAddUpdate
  },
  setup() {
    const User = new UserClass();
    const Theme = new ThemeClass();
    const Ticket = new TicketClass();

    const dialogTicketAddUpdateDefault = Ticket.dialogAddUpdateDefault;
    const dialogThemeAddUpdateDefault = Theme.dialogAddUpdateDefault;

    /** Columns */
    const columns = [
      { name: "id", label: "ID", field: "id", align: "left", sortable: true },
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
        name: "status",
        label: "СТАТУС",
        field: "status",
        align: "left",
        sortable: true,
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
      themeList,
      topLevelThemeList,
      dialogTicketAddUpdate: ref({}),
      dialogThemeAddUpdateDefault,
      dialogThemeAddUpdate: ref({}),
      dialogTicketAddUpdateDefault,
    };
  },

  async beforeMount() {
    await this.getData();
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
        iface: "service",
        method: "getList",
        args: {
          limit: rowsPerPage,
          offset: (page - 1) * rowsPerPage,
          order: [[sortBy, descending ? "DESC" : "ASC"]],
          // roleId
          // limit: rowsPerPage,
          // offset: 0
        },
      });
      // Если ошибка получения списка пользователей
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
      // Если получен список пользователей
      else if (response.type === "answer") {
        this.rows = response.args.rows;
        this.pagination.page = page;
        this.pagination.rowsPerPage = rowsPerPage;
        this.pagination.rowsNumber = response.args.count;
        this.pagination.sortBy = sortBy;
        this.pagination.descending = descending;
        this.pagesNumber = Math.ceil(
          response.args.count / this.pagination.rowsPerPage
        );
      }

      const responseTheme = await this.$q.ws.sendRequest({
        type: "query",
        iface: "service",
        method: "getGroupList",
        args: {},
      });
      if (response.type === "error") {
        this.$q.dialogStore.set({
          show: true,
          title: "Ошибка",
          text: "Ошибка получения списка тем",
          ok: {
            color: "red",
          },
        });
      } else if (response.type === "answer") {
        this.themeList = responseTheme.args.rows;
        this.topLevelThemeList = responseTheme.args.rows.filter(
          (row) => row.parentId === null
        );
      }
      this.ready = true;
      this.loading = false;
    },

    showDialogTicketAddUpdate () {
      const excludeFields = ['id', 'token', 'isDeleted', 'online', 'active'];
      const data = {};
      Object.keys(this.dialogTicketAddUpdateDefault.data).forEach(key => {
        if (!excludeFields.includes(key)){
          data[key] = this.dialogTicketAddUpdateDefault.data[key];
        }
      });
      this.dialogTicketAddUpdate = {
        show: true,
        method: 'add',
        onHide: () => this.dialogTicketAddUpdate = structuredClone(this.dialogTicketAddUpdateDefault),
        data
      }
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
    onTicketSave (result) {
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
          title: 'Тикет создан'
        });
        this.dialogTicketAddUpdate.show = false;
        this.getData();
      }
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
